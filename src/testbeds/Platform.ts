import {Testbed, TestbedEvents} from './Testbed';
import {EventEmitter} from 'events';
import {Request} from '../messaging/Message';
import {Connection} from '../bridge/Connection';
import {SourceMap} from '../sourcemap/SourceMap';
import {DebugFrame, DebugFrameDecoder, encodeFrame} from '../protocol/frame';
import {NotificationType, OperationResult} from '../protocol/vendor/debug';

type PromiseResolver<R> = (value: R | PromiseLike<R>) => void;
type PromiseRejector = (reason?: unknown) => void;
type PendingRequest = [Request<unknown>, PromiseResolver<unknown>, PromiseRejector];

export abstract class Platform extends EventEmitter implements Testbed {
    abstract connection: Connection;

    protected requests: PendingRequest[];

    private readonly decoder: DebugFrameDecoder;

    // Name of platform
    public abstract readonly name: string;

    // Optional monitor to receive all data from platform
    // protected abstract monitor?: (chunk: any) => void; TODO

    protected constructor() {
        super();
        this.requests = [];
        this.decoder = new DebugFrameDecoder();
    }

    meta(): Promise<string> {
        throw new Error("Method not implemented.");
    }

    // listen on duplex channel
    protected listen(): void {
        this.connection.channel.on('data', (data: Buffer) => this.receive(data));
        this.listenForErrors();
    }

    protected receive(data: Uint8Array): void {
        try {
            for (const frame of this.decoder.push(data)) {
                this.process(frame);
            }
        } catch (error) {
            this.failPending(error);
        }
    }

    protected listenForErrors(): void {
        this.connection.channel.on('error', (error: Error) => this.failPending(error));
    }

    // listen on duplex channel
    public deafen(): void {
        this.connection.channel.removeAllListeners('data');
    }

    protected process(frame: DebugFrame): void {
        const index = this.requests.findIndex(([request]) => this.matches(request, frame));
        this.emit(TestbedEvents.OnMessage, frame);

        if (index === -1) return;

        const [request, resolve, reject] = this.requests.splice(index, 1)[0];
        try {
            resolve(request.parser(frame.payload));
        } catch (error) {
            reject(error);
        }
    }

    private matches(request: Request<unknown>, frame: DebugFrame): boolean {
        if (request.notification !== frame.type) return false;
        if (frame.type !== NotificationType.NOTIFICATION_OPERATION_RESULT) return true;
        return OperationResult.decode(frame.payload).command === request.type;
    }

    protected failPending(error: unknown): void {
        const pending = this.requests.splice(0);
        for (const [, , reject] of pending) {
            reject(error);
        }
    }

    // kill connection
    public kill(): Promise<void> {
        this.connection.channel.destroy();
        return this.connection.channel.destroyed ? Promise.resolve() : Promise.reject(`Cannot close ${this.connection.channel}`);
    }

    // send request over duplex channel
    public sendRequest<R>(map: SourceMap.Mapping, request: Request<R>): Promise<R> {
        const frame = encodeFrame({
            type: request.type,
            payload: request.payload?.(map) ?? new Uint8Array()
        });
        this.emit(TestbedEvents.Send, frame);
        return new Promise((resolve, reject) => {
            const resolver: PromiseResolver<unknown> = value => resolve(value as R);
            const pending: PendingRequest = [request as Request<unknown>, resolver, reject];
            this.requests.push(pending);
            this.connection.channel.write(frame, (error: Error | null | undefined) => {
                if (error !== null && error !== undefined) {
                    const index = this.requests.indexOf(pending);
                    if (index !== -1) {
                        this.requests.splice(index, 1);
                        reject(error);
                    }
                }
            });
        });
    }
}
