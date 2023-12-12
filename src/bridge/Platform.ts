import {Connection, ConnectionEvents} from "./Connection";
import {EventEmitter} from "events";
import {Duplex} from "stream";
import {Request} from "../parse/Requests";
import {MessageQueue} from "../parse/MessageQueue";

type PromiseResolver<R> = (value: R | PromiseLike<R>) => void;

export abstract class Platform extends EventEmitter implements Connection {
    protected channel: Duplex;

    protected requests: [Request<any>, PromiseResolver<any>][];

    protected messages: MessageQueue;

    // Name of platform
    public abstract readonly name: string;

    // Optional monitor to receive all data from platform
    // protected abstract monitor?: (chunk: any) => void; TODO

    protected constructor(channel: Duplex) {
        super();
        this.channel = channel;
        this.requests = [];
        this.messages = new MessageQueue('\n');

        this.listen();
    }

    // listen on duplex channel
    protected listen(): void {
        this.channel.on('data', (data: Buffer) => {
            this.messages.push(data.toString());
            this.process();
        });
    }

    // listen on duplex channel
    public deafen(): void {
        this.channel.removeAllListeners('data');
    }

    // process messages in queue
    protected process(): void {
        // until no complete messages are left
        for (let message of this.messages) {
            const index: number = this.search(message);  // search request

            if (0 <= index && index < this.requests.length) {
                // parse and resolve
                const [candidate, resolver] = this.requests[index];
                resolver(candidate.parser(message));
                this.emit(ConnectionEvents.OnMessage, message);

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
        this.channel.destroy();
        return this.channel.destroyed ? Promise.resolve() : Promise.reject(`Cannot close ${this.channel}`);
    }

    // send request over duplex channel
    public sendRequest<R>(request: Request<R>): Promise<R> {
        return new Promise((resolve, reject) => {
            this.requests.push([request, resolve]);
            this.channel.write(`${request.instruction}${request.payload ?? ''}\n`, (err: any) => {
                if (err !== undefined) {
                    reject(err);
                }
            });
        });
    }
}
