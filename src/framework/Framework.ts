import {Testee, timeout} from './Testee';
import {HybridScheduler, Scheduler} from './Scheduler';
import {TestScenario} from './scenario/TestScenario';

import {TestbedSpecification} from '../testbeds/TestbedSpecification';

import {StyleType} from '../reporter';
import {styling} from '../reporter/Style';
import {SuiteResult} from '../reporter/Results';
import {Reporter} from '../reporter/Reporter';

interface DependenceTree {
    test: TestScenario;
    children: DependenceTree[];
}

export interface TesteeOptions {
    disabled?: boolean;
    timeout?: number;
    connectionTimout?: number;
}

export class Suite {
    public title: string;
    public scenarios: TestScenario[] = [];
    public testees: Testee[] = [];

    public scheduler: Scheduler;

    public constructor(title: string, scheduler: Scheduler = new HybridScheduler()) {
        this.title = title;
        this.scheduler = scheduler;
    }

    public testee(name: string, specification: TestbedSpecification, options: TesteeOptions = {}) {
        const testee = new Testee(name, specification, options.timeout ?? 2000, options.connectionTimout ?? 5000);
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

    private outputStyle: StyleType = StyleType.plain;

    private scheduled: Suite[] = [];

    public readonly reporter: Reporter = new Reporter(styling(this.outputStyle));

    private constructor() {
    }

    public suite(title: string, scheduler: Scheduler = new HybridScheduler()): Suite {
        return new Suite(title, scheduler);
    }

    public suites(): Suite[] {
        return this.scheduled;
    }

    public style(style: StyleType): void {
        this.outputStyle = style;
    }

    public styling(): StyleType {
        return this.outputStyle;
    }

    public async sequential(suites: Suite[]) {
        this.scheduled.concat(suites);
        this.reporter.general();
        const t0 = performance.now();
        for (const suite of suites) {
            for (const testee of suite.testees) {
                const order: TestScenario[] = suite.scheduler.sequential(suite);
                const result: SuiteResult = new SuiteResult(suite);

                const first: TestScenario = order[0];
                await timeout<Object | void>('Initialize testbed', testee.connector.timeout, testee.initialize(first.program, first.args ?? []).catch((e: Error) => result.error(e.message)));

                await this.runSuite(result, testee, order);
                this.reporter.report(result);
            }
        }
        const t1 = performance.now();
        this.reporter.results(t1 - t0);

        await Promise.all(suites.map(suite => suite.testees.map(async (testee: Testee) => {
            await timeout<Object | void>('Shutdown testbed', testee.timeout, testee.shutdown());
        })))
    }

    public async run(suites: Suite[]) {
        this.scheduled.concat(suites);
        this.reporter.general();
        const t0 = performance.now();
        await Promise.all(suites.map(async (suite: Suite) => {
            await Promise.all(suite.testees.map(async (testee: Testee) => {
                const order: TestScenario[] = suite.scheduler.sequential(suite);
                const result: SuiteResult = new SuiteResult(suite);

                const first: TestScenario = order[0];
                await timeout<Object | void>('Initialize testbed', testee.connector.timeout, testee.initialize(first.program, first.args ?? []).catch((e: Error) => result.error(e.message)));

                await this.runSuite(result, testee, order);
                this.reporter.report(result);
            }))
        }))
        const t1 = performance.now();
        this.reporter.results(t1 - t0);

        await Promise.all(suites.map(suite => suite.testees.map(async (testee: Testee) => {
            await timeout<Object | void>('Shutdown testbed', testee.timeout, testee.shutdown());
        })))
    }

    public async parallel(suites: Suite[]) {
        this.scheduled.concat(suites);
        this.reporter.general();
        const t0 = performance.now();
        await Promise.all(suites.map(async (suite: Suite) => {
            const order: TestScenario[][] = suite.scheduler.parallel(suite, suite.testees.length);
            await Promise.all(suite.testees.map(async (testee: Testee, i: number) => {
                // console.log(`scheduling on ${testee.name}`)
                const result: SuiteResult = new SuiteResult(suite);

                const first: TestScenario = order[i][0];
                await timeout<Object | void>('Initialize testbed', testee.connector.timeout, testee.initialize(first.program, first.args ?? []).catch((e: Error) => result.error(e.message)));

                for (let j = i; j < order.length; j += suite.testees.length) {
                    await this.runSuite(result, testee, order[j]);
                }
                this.reporter.report(result);
            }))

            await Promise.all(suite.testees.map(async (testee: Testee) => {
                await timeout<Object | void>('Shutdown testbed', testee.timeout, testee.shutdown());
            }))
        }))

        const t1 = performance.now();
        this.reporter.results(t1 - t0);
    }

    private async runSuite(result: SuiteResult, testee: Testee, order: TestScenario[]) {
        for (const test of order) {
            await testee.describe(test, result, this.runs);
        }
    }

    // Analyse flakiness
    public analyse(suite: Suite[], runs: number = 3) {
        this.runs = runs;
        this.run(suite);
    }

    public static getImplementation() {
        if (!Framework.implementation) {
            Framework.implementation = new Framework();
        }

        return Framework.implementation;
    }
}