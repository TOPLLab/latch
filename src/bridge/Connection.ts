import {Duplex} from "stream";

export interface Connection {
    channel: Duplex;
}