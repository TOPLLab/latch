import {Medium} from './Medium';
import {SerialPort} from "serialport";

export class Serial implements Medium {
    public channel: SerialPort;

    constructor(channel: SerialPort) {
        this.channel = channel;
    }
}