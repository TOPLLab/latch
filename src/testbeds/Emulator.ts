import {Platform} from './Platform';
import {SubProcess} from '../bridge/SubProcess';
import {Connection} from '../bridge/Connection';
import {UploaderFactory} from '../manage/Uploader';
import {ARDUINO, EMULATOR} from '../util/env';
import {ProxySpecification} from './TestbedSpecification';
import {CompileOutput} from '../manage/Compiler';
import * as net from 'node:net';
import {SourceMap} from '../sourcemap/SourceMap';
import {Request} from '../messaging/Message';
import {AddressInfo, Socket} from 'node:net';
import {MessageQueue} from '../messaging/MessageQueue';

export class Emulator extends Platform {
    readonly name: string = 'Emulator';

    connection: SubProcess;

    constructor(connection: SubProcess) {
        super();
        this.connection = connection;

        this.listen();
    }

    kill(): Promise<void> {
        this.connection.child?.kill();
        return super.kill();
    }
}

/**
 * Dummy proxy object, forwards all requests on a dummy port to the real proxy instance
 *
 * todo this allows for testing the communication between supervisor and proxy
 */
export class DummyProxy extends Emulator {
    dummy: net.Server;

    protected forwarding: MessageQueue;

    private supervisor?: Socket;

    constructor(connection: SubProcess) {
        super(connection);

        this.forwarding = new MessageQueue('\n');

        this.dummy = new net.Server();
    }

    public async init(specification: ProxySpecification) {
        this.dummy.on('connection', (connection) => {
            this.supervisor = connection;
            connection.on('data', (data) => {
                this.connection.channel.write(data.toString());
            })
        });
        this.dummy.listen(specification.dummy.port);
    }

    protected listen(): void {
        this.connection.channel.on('data', (data: Buffer) => {
            if (this.waitingForMessages()) {
                this.messages.push(data.toString());
                this.process();
            } else {
                this.forwarding.push(data.toString());
                while (this.forwarding.hasCompleteMessage()) {
                    const message = this.forwarding.pop()
                    if(!message?.includes('Interrupt')) this.supervisor!.write(message!.toString());
                }

            }
        });
    }

    private waitingForMessages(): boolean {
        return this.requests.length > 0;
    }
}