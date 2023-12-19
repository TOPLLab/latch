import {Request} from '../messaging/Message';
import {EventEmitter} from 'events';
import {Connection} from '../bridge/Connection';
import {SourceMap} from '../sourcemap/SourceMap';

export enum TesteeEvents {
    OnMessage = 'message',
    OnPushEvent = 'push'
}

export declare interface Testbed extends EventEmitter {
    readonly name: string;

    connection: Connection;

    sendRequest<R>(map: SourceMap.Mapping, request: Request<R>): Promise<R>;

    kill(): Promise<void>;

    on(event: TesteeEvents.OnMessage, listener: (message: string) => void): this;

    on(event: TesteeEvents.OnPushEvent, listener: (data: string) => void): this;
}
