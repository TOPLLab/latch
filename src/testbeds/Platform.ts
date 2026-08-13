import {Testbed, TestbedEvents} from './Testbed';
import {EventEmitter} from 'events';
import {Request} from '../messaging/Message';
import {MessageQueue} from '../messaging/MessageQueue';
import {Connection} from '../bridge/Connection';
import {SourceMap} from '../sourcemap/SourceMap';

type PromiseResolver<R> = (value: R | PromiseLike<R>) => void;
type PromiseRejector = (reason?: unknown) => void;

export abstract class Platform extends EventEmitter implements Testbed {
    abstract connection: Connection;

    protected requests: [Request<any>, PromiseResolver<any>, PromiseRejector][];

    protected messages: MessageQueue;

    // Name of platform
    public abstract readonly name: string;

    // Optional monitor to receive all data from platform
    // protected abstract monitor?: (chunk: any) => void; TODO

    protected constructor() {
        super();
        this.requests = [];
        this.messages = new MessageQueue('\n');
    }

    // listen on duplex channel
    protected listen(): void {
        this.connection.channel.on('data', (data: Buffer) => {
            this.messages.push(data.toString());
            this.process();
        });
        this.listenForErrors();
    }

    protected listenForErrors(): void {
        this.connection.channel.on('error', (error: Error) => this.failPending(error));
    }

    // listen on duplex channel
    public deafen(): void {
        this.connection.channel.removeAllListeners('data');
    }

    // process messages in queue
    protected process(): void {
        // until no complete messages are left
        for (const message of this.messages) {
            const index: number = this.search(message);  // search request

            if (0 <= index && index < this.requests.length) {
                // messaging and resolve
                const [candidate, resolver] = this.requests[index];
                resolver(candidate.parser(message));
                this.emit(TestbedEvents.OnMessage, message);

                this.requests.splice(index, 1);  // delete resolved request
            }
        }
    }

    protected failPending(error: Error): void {
        const pending = this.requests.splice(0);
        for (const [, , reject] of pending) {
            reject(error);
        }
    }

    // search for oldest request matching message
    private search(message: string): number {
        let index: number = 0;
        while (index < this.requests.length) {
            const [candidate] = this.requests[index];
            try {
                // try candidate parser
                candidate.parser(message);
                return index;
            } catch {
                // failure: try next request
                index++;
            }
        }
        return -1;
    }

    // kill connection
    public kill(): Promise<void> {
        this.connection.channel.destroy();
        return this.connection.channel.destroyed ? Promise.resolve() : Promise.reject(`Cannot close ${this.connection.channel}`);
    }

    // send request over duplex channel
    public sendRequest<R>(map: SourceMap.Mapping, request: Request<R>): Promise<R> {
        const message = `${request.type}${request.payload?.(map) ?? ''}\n`;
        this.emit(TestbedEvents.Send, message);
        return new Promise((resolve, reject) => {
            const pending: [Request<any>, PromiseResolver<any>, PromiseRejector] = [request, resolve, reject];
            this.requests.push(pending);
            this.connection.channel.write(message, (err: Error | null | undefined) => {
                if (err !== null && err !== undefined) {
                    const index = this.requests.indexOf(pending);
                    if (index !== -1) {
                        this.requests.splice(index, 1);
                        reject(err);
                    }
                }
            });
        });
    }
}
