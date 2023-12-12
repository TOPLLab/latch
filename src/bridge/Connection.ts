import {Request} from '../parse/Requests';
import {EventEmitter} from 'events';

export enum ConnectionEvents {
    OnMessage = 'message',
    OnPushEvent = 'push'
}

export declare interface Connection extends EventEmitter {
    readonly name: string;

    sendRequest<R>(request: Request<R>): Promise<R>;

    kill(): Promise<void>;

    on(event: ConnectionEvents.OnMessage, listener: (message: string) => void): this;

    on(event: ConnectionEvents.OnPushEvent, listener: (data: string) => void): this;
}
