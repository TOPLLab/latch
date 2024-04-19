import {Serial} from '../bridge/Serial';
import {Platform} from './Platform';
import {TesteeSpecification} from './TesteeSpecification';

export class Arduino extends Platform {
    public readonly name: string = 'Hardware';

    connection?: Serial;

    constructor(specification: TesteeSpecification) {
        super(specification);
    }
}