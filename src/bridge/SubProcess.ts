import {ChildProcess} from 'child_process';
import {Duplex} from 'stream';
import {Connection} from './Connection';

export class SubProcess implements Connection {
    public channel: Duplex;
    public child: ChildProcess;

    constructor(channel: Duplex, process: ChildProcess) {
        this.channel = channel;
        this.child = process;
    }
}