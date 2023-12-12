import {ChildProcess} from 'child_process';
import {Duplex} from 'stream';
import {Medium} from './Medium';

export class SubProcess implements Medium {
    public channel: Duplex;
    public child: ChildProcess;

    constructor(channel: Duplex, process: ChildProcess) {
        this.channel = channel;
        this.child = process;
    }
}