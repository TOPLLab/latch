import {ChildProcess} from 'child_process';
import {Duplex} from 'stream';
import {Connection} from './Connection';

export class SubProcess implements Connection {
    public readonly address: string;
    public channel: Duplex;
    public child: ChildProcess;

    constructor(address: string, channel: Duplex, process: ChildProcess) {
        this.address = address;
        this.channel = channel;
        this.child = process;
    }
}