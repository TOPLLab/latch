import {Connection} from './Connection';
import {SerialPort} from "serialport";

export class Serial implements Connection {
    public channel: SerialPort;

    constructor(channel: SerialPort) {
        this.channel = channel;
    }
}