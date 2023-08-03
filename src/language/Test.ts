import {Framework} from '../framework/Framework';
import {TestResult, testResult} from '../framework/TestResult';

class Test {
    private readonly testResult: TestResult;

    constructor(private readonly framework: Framework, start: number = Date.now()) {
        this.testResult = testResult();
    }
}