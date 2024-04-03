import {Testee, TestbedEvents} from './Testee';
import {EventEmitter} from 'events';
import {Request} from '../messaging/Message';
import {MessageQueue} from '../messaging/MessageQueue';
import {Connection} from '../bridge/Connection';
import {SourceMap} from '../sourcemap/SourceMap';

type PromiseResolver<R> = (value: R | PromiseLike<R>) => void;

export abstract class Platform extends EventEmitter implements Testee {
    abstract connection: Connection;

    protected requests: [Request<any>, PromiseResolver<any>][];

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
    }

    // listen on duplex channel
    public deafen(): void {
        this.connection.channel.removeAllListeners('data');
    }

    // process messages in queue
    protected process(): void {
        // until no complete messages are left
        for (let message of this.messages) {
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

    // search for oldest request matching message
    private search(message: string): number {
        let index: number = 0;
        while (index < this.requests.length) {
            const [candidate, resolver] = this.requests[index];
            try {
                // try candidate parser
                candidate.parser(message);
                return index;
            } catch (e) {
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
        return new Promise((resolve, reject) => {
            this.requests.push([request, resolve]);
            this.connection.channel.write(`${request.type}${request.payload?.(map) ?? ''}\n`, (err: any) => {
                if (err !== null) {
                    reject(err);
                }
            });
        });
    }
}
