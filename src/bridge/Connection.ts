import {Duplex} from "stream";

export interface Connection {
    address: string;
    channel: Duplex;
}
