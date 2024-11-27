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
import {AddressInfo} from 'node:net';

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
 */
export class DummyProxy extends Emulator {
    dummy: net.Server;

    constructor(connection: SubProcess, specification: ProxySpecification) {
        super(connection);

        this.dummy = new net.Server();
        this.dummy.on('connection', (connection) => {
            connection.on('data', (data) => {
                this.connection.channel.write(data);
            })
        })
        this.dummy.listen(specification.dummy.port);
    }
}