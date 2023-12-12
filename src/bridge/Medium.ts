import {Duplex} from "stream";

export interface Medium {
    channel: Duplex;
}