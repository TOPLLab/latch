import {Connection} from './Connection';
import {SerialPort} from "serialport";

export class Serial implements Connection {
    public readonly address: string;
    public channel: SerialPort;

    constructor(address: string, channel: SerialPort) {
        this.address = address;
        this.channel = channel;
    }
}