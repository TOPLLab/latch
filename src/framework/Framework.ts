import {Testee, timeout} from './Testee';
import {HybridScheduler, Scheduler} from './Scheduler';
import {TestScenario} from './scenario/TestScenario';

import {TestbedSpecification} from '../testbeds/TestbedSpecification';

import {SuiteResult} from '../reporter/Results';
import {Reporter} from '../reporter/Reporter';
import {Outcome} from "../reporter/Outcome";
import {InkReporter} from '../reporter/ink/InkReporter';

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

    private scheduled: Suite[] = [];

    public readonly reporter: Reporter = new InkReporter();

    private constructor() {
    }

    public suite(title: string, scheduler: Scheduler = new HybridScheduler()): Suite {
        return new Suite(title, scheduler);
    }

    public suites(): Suite[] {
        return this.scheduled;
    }

    public async sequential(suites: Suite[]): Promise<boolean> {
        let success: boolean = true;

        this.scheduled = this.scheduled.concat(suites);
        this.reporter.start();
        const t0 = performance.now();
        try {
            let executionIndex = 0;
            for (const suite of suites) {
                for (const testee of suite.testees) {
                    const order: TestScenario[] = suite.scheduler.sequential(suite);
                    const result = await this.executeSuite(suite, testee, order, ++executionIndex);
                    success = success && result.outcome === Outcome.succeeded;
                }
            }

            await this.shutdown(suites);

            return success;
        } finally {
            const t1 = performance.now();
            await this.reporter.finish(t1 - t0);
            await this.reporter.close();
        }
    }

    public async run(suites: Suite[]): Promise<boolean> {
        let success: boolean = true;

        this.scheduled = this.scheduled.concat(suites);
        this.reporter.start();
        const t0 = performance.now();
        try {
            let executionIndex = 0;
            await Promise.all(suites.map(async (suite: Suite) => {
                await Promise.all(suite.testees.map(async (testee: Testee) => {
                    const order: TestScenario[] = suite.scheduler.sequential(suite);
                    const result = await this.executeSuite(suite, testee, order, ++executionIndex);
                    success = success && result.outcome === Outcome.succeeded;
                }))
            }))

            await this.shutdown(suites);

            return success;
        } finally {
            const t1 = performance.now();
            await this.reporter.finish(t1 - t0);
            await this.reporter.close();
        }
    }

    public async parallel(suites: Suite[]) {
        this.scheduled = this.scheduled.concat(suites);
        this.reporter.start();
        const t0 = performance.now();
        try {
            let executionIndex = 0;
            await Promise.all(suites.map(async (suite: Suite) => {
                const order: TestScenario[][] = suite.scheduler.parallel(suite, suite.testees.length);
                await Promise.all(suite.testees.map(async (testee: Testee, i: number) => {
                    const result: SuiteResult = new SuiteResult(suite);
                    const runId = this.runId(suite, testee, ++executionIndex);

                    this.reporter.suiteStarted({
                        id: runId,
                        suite: result,
                        suiteTitle: suite.title,
                        testeeName: testee.name,
                        executionIndex,
                        startedAt: Date.now(),
                        plannedScenarios: order.flat().length,
                        plannedActions: order.flat().flatMap((scenario) => scenario.steps ?? []).length
                    });

                    try {
                        const first: TestScenario = order[i][0];
                        await timeout<Object | void>('Initialize testbed', testee.connector.timeout, testee.initialize(first.program, first.args ?? []).catch((e: unknown) => result.error(errorMessage(e))));
                        this.reportMetadata(runId, testee);

                        for (let j = i; j < order.length; j += suite.testees.length) {
                            await this.runSuite(result, testee, order[j], runId);
                        }
                    } catch (e) {
                        result.error(e instanceof Error ? e.message : `${e}`);
                    } finally {
                        this.reporter.suiteFinished(runId, result);
                    }
                }))

                await Promise.all(suite.testees.map(async (testee: Testee) => {
                    await timeout<Object | void>('Shutdown testbed', testee.timeout, testee.shutdown());
                }))
            }))
        } finally {
            const t1 = performance.now();
            await this.reporter.finish(t1 - t0);
            await this.reporter.close();
        }
    }

    private async runSuite(result: SuiteResult, testee: Testee, order: TestScenario[], runId: string) {
        for (const test of order) {
            await testee.describe(test, result, runId, this.runs);
        }
    }

    public analyse(suite: Suite[], runs: number = 1) {
        this.runs = runs;
        this.run(suite).then((success: boolean) => process.exit(success ? 0 : 1));
    }

    private async executeSuite(suite: Suite, testee: Testee, order: TestScenario[], executionIndex: number): Promise<SuiteResult> {
        const result: SuiteResult = new SuiteResult(suite);
        const runId = this.runId(suite, testee, executionIndex);

        this.reporter.suiteStarted({
            id: runId,
            suite: result,
            suiteTitle: suite.title,
            testeeName: testee.name,
            executionIndex,
            startedAt: Date.now(),
            plannedScenarios: order.length,
            plannedActions: order.flatMap((scenario) => scenario.steps ?? []).length
        });

        try {
            const first: TestScenario = order[0];
            await timeout<Object | void>('Initialize testbed', testee.connector.timeout, testee.initialize(first.program, first.args ?? []).catch((e: unknown) => result.error(errorMessage(e))));
            this.reportMetadata(runId, testee);
            await this.runSuite(result, testee, order, runId);
        } catch (e) {
            result.error(e instanceof Error ? e.message : `${e}`);
        } finally {
            this.reporter.suiteFinished(runId, result);
        }

        return result;
    }

    private async shutdown(suites: Suite[]) {
        await Promise.all(suites.flatMap(suite => suite.testees.map(async (testee: Testee) => {
            await timeout<Object | void>('Shutdown testbed', testee.timeout, testee.shutdown());
        })));
    }

    private runId(suite: Suite, testee: Testee, executionIndex: number): string {
        return `${suite.title}:${testee.name}:${executionIndex}`;
    }

    private reportMetadata(runId: string, testee: Testee): void {
        const testbed = testee.bed();
        if (testbed !== undefined) {
            this.reporter.metadata?.(runId, testbed.meta());
        }
    }

    public static getImplementation() {
        if (!Framework.implementation) {
            Framework.implementation = new Framework();
        }

        return Framework.implementation;
    }
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
