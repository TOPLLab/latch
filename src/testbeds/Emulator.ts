import {Platform} from './Platform';
import {SubProcess} from '../bridge/SubProcess';
import {TesteeSpecification} from './TesteeSpecification';

export class Emulator extends Platform {
    readonly name: string = 'Emulator';

    connection?: SubProcess;

    constructor(specification: TesteeSpecification) {
        super(specification);
    }

    kill(): Promise<void> {
        this.connection?.child.kill();
        return super.kill();
    }
}
