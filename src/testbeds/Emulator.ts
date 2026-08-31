import {Platform} from './Platform';
import {SubProcess} from '../bridge/SubProcess';
import {ProxySpecification} from './TestbedSpecification';
import * as net from 'node:net';
import {Socket} from 'node:net';
import {Meta, TestbedEvents} from './Testbed';
import {EMULATOR} from "../util/env";
import {execFileAsync} from "../util/util";

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

    async meta(): Promise<string> {
        const {stdout} = await execFileAsync(EMULATOR, ['--version']);
        const version = stdout.match(/\d+\.\d+\.\d+/)?.[0];

        if (version === undefined) {
            throw new Error(`Unable to determine WARDuino version from: ${stdout.trim()}`);
        }

        return JSON.stringify({
            [Meta.Name]: 'warduino',
            [Meta.Architecture]: 'emulator',
            [Meta.Version]: version
        });
    }
}

/**
 * Dummy proxy object, forwards all requests on a dummy port to the real proxy instance
 *
 * todo this allows for testing the communication between supervisor and proxy
 */
export class DummyProxy extends Emulator {
    dummy: net.Server;

    private supervisor?: Socket;

    constructor(connection: SubProcess, specification: ProxySpecification) {
        super(connection);

        this.dummy = new net.Server();

        this.dummy.on('connection', (connection) => {
            this.supervisor = connection;
            connection.on('error', (error: Error) => this.failPending(error));
            connection.on('data', (data) => this.connection.channel.write(data));
            this.emit(TestbedEvents.Ready);
        });
        this.dummy.on('error', (error: Error) => this.failPending(error));
        this.dummy.listen(specification.dummy.port);
    }

    protected listen(): void {
        this.listenForErrors();
        this.connection.channel.on('data', (data: Buffer) => {
            if (this.waitingForMessages()) {
                this.receive(data);
            } else {
                this.supervisor?.write(data);
            }
        });
    }

    private waitingForMessages(): boolean {
        return this.requests.length > 0;
    }
}
