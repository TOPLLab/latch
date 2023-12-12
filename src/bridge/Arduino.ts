import {Serial} from "./Serial";
import {Platform} from "./Platform";

export class Arduino extends Platform {
    public readonly name: string = 'Hardware';

    constructor(medium: Serial) {
        super(medium.channel);
    }
}