import {Testee} from './Testee';
import {HybridScheduler, Scheduler} from './Scheduler';
import {TestScenario} from './scenario/TestScenario';

import {TestbedSpecification} from '../testbeds/TestbedSpecification';

export interface Suite {
    title: string;
    tests: TestScenario[];
}

interface DependenceTree {
    test: TestScenario;
    children: DependenceTree[];
}

export class Framework {
    private static implementation: Framework;

    private testees: Testee[] = [];
    private suites: Suite[] = [];

    public runs: number = 1;

    private constructor() {
    }

    private currentSuite(): Suite {
        return this.suites[this.suites.length - 1];
    }

    public testee(name: string, specification: TestbedSpecification, scheduler: Scheduler = new HybridScheduler(), disabled: boolean = false) {
        const testee = new Testee(name, specification, scheduler);
        if (disabled) {
            testee.skipall();
        }

        this.testees.push(testee);
    }

    public platforms(): Testee[] {
        return this.testees;
    }

    public suite(title: string) {
        this.suites.push({title: title, tests: []});
    }

    public test(test: TestScenario) {
        this.currentSuite().tests.push(test);
    }

    public tests(tests: TestScenario[]) {
        tests.forEach(test => this.currentSuite().tests.push(test));
    }

    public run(cores: number = 1) {   // todo remove cores
        this.suites.forEach((suite: Suite) => {
            this.testees.forEach((testee: Testee) => {
                describe(`Testing on ${testee.name}.`, () => {
                    // todo add parallelism
                    const order: TestScenario[] = testee.scheduler.schedule(suite);

                    // if (!bed.disabled) { // TODO necessary? isn't this done in de test itself?
                    //
                    //     after('Shutdown debugger', async function () {
                    //         if (bed.describer.instance) {
                    //             await bed.connection.kill();
                    //         }
                    //     });
                    // }

                    let initialized: boolean = false;

                    order.forEach((test: TestScenario) => {
                        if (!initialized) {
                            before('Initialize testbed', async function () {
                                this.timeout(testee.connector.timeout);
                                await testee.initialize(test.program, test.args ?? []);
                            });
                            initialized = true;
                        }

                        testee.describe(test, this.runs);
                    });
                });
            });
        });
    }

    // Analyse flakiness
    public analyse(runs: number = 3, cores: number = 1) {
        this.runs = runs;
        this.run(cores);
    }

    public static getImplementation() {
        if (!Framework.implementation) {
            Framework.implementation = new Framework();
        }

        return Framework.implementation;
    }
}