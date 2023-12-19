import {Serial} from '../bridge/Serial';
import {Platform} from './Platform';

export class Arduino extends Platform {
    public readonly name: string = 'Hardware';

    connection: Serial;

    constructor(connection: Serial) {
        super();
        this.connection = connection;

        this.listen();
    }
}