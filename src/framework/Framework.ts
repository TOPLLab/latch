import {Testee} from './Testee';
import {HybridScheduler, Scheduler} from './Scheduler';
import {TestScenario} from './scenario/TestScenario';

import {TestbedSpecification} from '../testbeds/TestbedSpecification';

export interface Suite {
    title: string;
    tests: TestScenario[];
    testees: Testee[];
}

interface DependenceTree {
    test: TestScenario;
    children: DependenceTree[];
}

export interface TesteeOptions {
    disabled?: boolean;
    timeout?: number;
    connectionTimout?: number;
}

export class Framework {
    private static implementation: Framework;

    private testSuites: Suite[] = [];

    public runs: number = 1;

    private constructor() {
    }

    private currentSuite(): Suite {
        return this.testSuites[this.testSuites.length - 1];
    }

    public testee(name: string, specification: TestbedSpecification, scheduler: Scheduler = new HybridScheduler(), options: TesteeOptions = {}) {
        const testee = new Testee(name, specification, scheduler, options.timeout ?? 2000, options.connectionTimout ?? 5000);
        if (options.disabled) {
            testee.skipall();
        }

        this.currentSuite().testees.push(testee);
    }

    public suites(): Suite[] {
        return this.testSuites;
    }

    public suite(title: string) {
        this.testSuites.push({title: title, tests: [], testees: []});
    }

    public test(test: TestScenario) {
        this.currentSuite().tests.push(test);
    }

    public tests(tests: TestScenario[]) {
        tests.forEach(test => this.currentSuite().tests.push(test));
    }

    public run(cores: number = 1) {   // todo remove cores
        this.testSuites.forEach((suite: Suite) => {
            suite.testees.forEach((testee: Testee) => {
                const order: TestScenario[] = testee.scheduler.schedule(suite);
                const first: TestScenario = order[0];
                before('Initialize testbed', async function () {
                    this.timeout(testee.connector.timeout(testee.specification.type));
                    await testee.initialize(first.program, first.args ?? []).catch((e) => Promise.reject(e));
                });

                describe(`${testee.name}: ${suite.title}`, () => {
                    // todo add parallelism

                    // if (!bed.disabled) { // TODO necessary? isn't this done in de test itself?
                    //
                    //     after('Shutdown debugger', async function () {
                    //         if (bed.describer.instance) {
                    //             await bed.connection.kill();
                    //         }
                    //     });
                    // }

                    order.forEach((test: TestScenario) => {
                        testee.describe(test, this.runs);
                    });
                });

                after('Shutdown testbed', async function () {
                    await testee.shutdown();
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