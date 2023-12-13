import {Platform} from './Platform';
import {SubProcess} from './SubProcess';

export class Emulator extends Platform {
    readonly name: string = 'Emulator';

    connection: SubProcess;

    constructor(connection: SubProcess) {
        super();
        this.connection = connection;

        this.listen();
    }

    kill(): Promise<void> {
        this.connection.child.kill();
        return super.kill();
    }
}
