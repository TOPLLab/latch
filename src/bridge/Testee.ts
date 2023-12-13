import {Request} from '../parse/Requests';
import {EventEmitter} from 'events';
import {Connection} from './Connection';
import {SourceMap} from '../sourcemap/SourceMap';

export enum TesteeEvents {
    OnMessage = 'message',
    OnPushEvent = 'push'
}

export declare interface Testee extends EventEmitter {
    readonly name: string;

    connection: Connection;

    sendRequest<R>(map: SourceMap.Mapping, request: Request<R>): Promise<R>;

    kill(): Promise<void>;

    on(event: TesteeEvents.OnMessage, listener: (message: string) => void): this;

    on(event: TesteeEvents.OnPushEvent, listener: (data: string) => void): this;
}
