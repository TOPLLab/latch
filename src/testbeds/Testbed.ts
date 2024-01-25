import {Request} from '../messaging/Message';
import {EventEmitter} from 'events';
import {Connection} from '../bridge/Connection';
import {SourceMap} from '../sourcemap/SourceMap';

export enum TestbedEvents {
    OnMessage = 'message',
    OnPushEvent = 'push'
}

export declare interface Testbed extends EventEmitter {
    readonly name: string;

    connection: Connection;

    sendRequest<R>(map: SourceMap.Mapping, request: Request<R>): Promise<R>;

    kill(): Promise<void>;

    on(event: TestbedEvents.OnMessage, listener: (message: string) => void): this;

    on(event: TestbedEvents.OnPushEvent, listener: (data: string) => void): this;
}
