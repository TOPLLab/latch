import {Request} from '../messaging/Message';
import {EventEmitter} from 'events';
import {Connection} from '../bridge/Connection';
import {SourceMap} from '../sourcemap/SourceMap';
import {Breakpoint} from '../debug/Breakpoint';

export enum TestbedEvents {
    OnMessage = 'message',
    OnBreakpointHit = 'breakpoint',
    OnPushEvent = 'push'
}

export declare interface Testee extends EventEmitter {
    readonly name: string;

    connection?: Connection;

    connect(timeout: number, program: string, args: string[]): Promise<Connection>;

    connected(): boolean;

    sendRequest<R>(map: SourceMap.Mapping, request: Request<R>): Promise<R>;

    kill(): Promise<void>;

    on(event: TestbedEvents.OnMessage, listener: (message: string) => void): this;

    on(event: TestbedEvents.OnBreakpointHit, listener: (message: Breakpoint) => void): this;

    on(event: TestbedEvents.OnPushEvent, listener: (data: string) => void): this;
}
