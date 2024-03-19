import {Testee} from './Testee';
import {HybridScheduler, Scheduler} from './Scheduler';
import {TestScenario} from './scenario/TestScenario';

import {TestbedSpecification} from '../testbeds/TestbedSpecification';

export interface Suite {

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

export enum OutputStyle {
    silent, // TODO
    plain,
    github
}

export class Suite {
    public title: string;
    public scenarios: TestScenario[] = [];
    public testees: Testee[] = [];

    public constructor(title: string) {
        this.title = title;
    }

    public testee(name: string, specification: TestbedSpecification, scheduler: Scheduler = new HybridScheduler(), options: TesteeOptions = {}) {
        const testee = new Testee(name, specification, scheduler, options.timeout ?? 2000, options.connectionTimout ?? 5000);
        if (options.disabled) {
            testee.skipall();
        }

        this.testees.push(testee);
    }

    public test(test: TestScenario) {
        this.scenarios.push(test);
    }

    public tests(tests: TestScenario[]) {
        tests.forEach(test => this.scenarios.push(test));
    }
}

export class Framework {
    private static implementation: Framework;

    public runs: number = 1;

    private outputStyle: OutputStyle = OutputStyle.plain;

    private scheduled: Suite[] = [];

    private constructor() {
    }

    public suite(title: string): Suite {
        return new Suite(title);
    }

    public suites(): Suite[] {
        return this.scheduled;
    }

    public style(style: OutputStyle): void {
        this.outputStyle = style;
    }

    public styling(): OutputStyle {
        return this.outputStyle;
    }

    public run(suites: Suite[], cores: number = 1) {   // todo remove cores
        this.scheduled.concat(suites);
        suites.forEach((suite: Suite) => {
            suite.testees.forEach((testee: Testee) => {
                const order: TestScenario[] = testee.scheduler.schedule(suite);
                const first: TestScenario = order[0];
                before('Initialize testbed', async function () {
                    this.timeout(testee.connector.timeout);
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
    public analyse(suite: Suite[], runs: number = 3, cores: number = 1) {
        this.runs = runs;
        this.run(suite, cores);
    }

    public static getImplementation() {
        if (!Framework.implementation) {
            Framework.implementation = new Framework();
        }

        return Framework.implementation;
    }
}