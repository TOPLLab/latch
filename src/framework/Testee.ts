import {Framework} from './Framework';
import {SourceMap} from '../sourcemap/SourceMap';
import {Message, Request} from '../messaging/Message';
import {Testbed} from '../testbeds/Testbed';
import {TestbedFactory} from '../testbeds/TestbedFactory';
import {Kind} from './scenario/Step';
import {SourceMapFactory} from '../sourcemap/SourceMapFactory';
import {TestScenario} from './scenario/TestScenario';
import {TestbedSpecification} from '../testbeds/TestbedSpecification';
import {CompileOutput, CompilerFactory} from '../manage/Compiler';
import {WABT} from '../util/env';
import {Completion, expect, Result, ScenarioResult, SuiteResults} from './Reporter';

export function timeout<T>(label: string, time: number, promise: Promise<T>): Promise<T> {
    if (time === 0) {
        return promise;
    }
    return Promise.race([promise, new Promise<T>((resolve, reject) => setTimeout(() => reject(`timeout when ${label}`), time))]);
}

/**
 * @param object object to retrieve value from
 * @param field dot string describing the field of the value (or path)
 */
export function getValue(object: any, field: string): any {
    // convert indexes to properties + remove leading dots
    field = field.replace(/\[(\w+)]/g, '.$1');
    field = field.replace(/^\.?/, '');

    for (const accessor of field.split('.')) {
        if (accessor in object) {
            object = object[accessor];
        } else {
            // specified field does not exist
            return undefined;
        }
    }
    return object;
}

export class Testee { // TODO unified with testbed interface

    /** The current state for each described test */
    private states: Map<string, Result> = new Map<string, Result>();

    /** Factory to establish new connections to VMs */
    public readonly connector: TestbedFactory;

    public readonly mapper: SourceMapFactory;

    public readonly specification: TestbedSpecification;

    public readonly timeout: number;

    private framework: Framework;

    private readonly maximumConnectAttempts = 5;

    public readonly name: string;

    public testbed?: Testbed;

    constructor(name: string, specification: TestbedSpecification, timeout: number, connectionTimeout: number) {
        this.name = name;
        this.specification = specification;
        this.timeout = timeout;
        this.connector = new TestbedFactory(connectionTimeout);
        this.mapper = new SourceMapFactory();
        this.framework = Framework.getImplementation();
    }

    public async initialize(program: string, args: string[]): Promise<Testee> {
        return new Promise(async (resolve, reject) => {
            const testbed: Testbed | void = await this.connector.initialize(this.specification, program, args ?? []).catch((e) => {
                reject(e)
            });
            if (testbed) {
                this.testbed = testbed;
            }
            resolve(this);
        });
    }

    public async shutdown(): Promise<void> {
        return this.testbed?.kill();
    }

    private run(name: string, limit: number, fn: () => Promise<any>) {
        return timeout<Object | void>(name, limit, fn());
    }

    private step(name: string, limit: number, fn: () => Promise<any>) {
        return timeout<Object | void>(name, limit, fn());
    }

    public async describe(description: TestScenario, suiteResult: SuiteResults, runs: number = 1) {
        const testee = this;
        const scenarioResult: ScenarioResult = new ScenarioResult(description, testee);

        if (description.skip) {
            return;
        }

        // call(this.formatTitle(description.title), function () {
        let map: SourceMap.Mapping = new SourceMap.Mapping();

        /** Each test requires some housekeeping before and after */
        await this.run('Check for failing dependencies', testee.timeout, async function () {
            const failedDependencies: TestScenario[] = testee.failedDependencies(description);
            if (failedDependencies.length > 0) {
                testee.states.set(description.title, new Result('Skipping', 'Test has failing dependencies', Completion.skipped));
                throw new Error(`Skipped: failed dependent tests: ${failedDependencies.map(dependence => dependence.title)}`);
            }
        }).catch((e: Error) => {
            scenarioResult.error = e;
        });

        await this.run('Compile and upload program', testee.connector.timeout, async function () {
            let compiled: CompileOutput = await new CompilerFactory(WABT).pickCompiler(description.program).compile(description.program);
            try {
                await timeout<Object | void>(`uploading module`, testee.timeout, testee.testbed!.sendRequest(new SourceMap.Mapping(), Message.updateModule(compiled.file))).catch((e) => Promise.reject(e));
            } catch (e) {
                await testee.initialize(description.program, description.args ?? []).catch((o) => Promise.reject(o));
            }
        }).catch((e: Error) => {
            scenarioResult.error = e;
        });

        await this.run('Compile and upload program', testee.connector.timeout, async function () {
            map = await testee.mapper.map(description.program);
        }).catch((e: Error) => {
            scenarioResult.error = e;
        });

        if (scenarioResult.error) {
            suiteResult.scenarios.push(scenarioResult);
            return;
        }

        /** Each test is made of one or more scenario */

        let previous: any = undefined;
        for (let i = 0; i < runs; i++) {
            if (0 < i) {
                await this.run('resetting before retry', testee.timeout, async function () {
                    await testee.reset(testee.testbed);
                }).catch((e: Error) => {
                    scenarioResult.error = e;
                });
            }

            for (const step of description.steps ?? []) {
                /** Perform the step and check if expectations were met */
                await this.step(step.title, testee.timeout, async function () {
                    let result: Result = new Result(step.title, 'incomplete');
                    if (testee.testbed === undefined) {
                        testee.states.set(description.title, result);
                        result.error('Cannot run test: no debugger connection.');
                        testee.states.set(description.title, result);
                        return;
                    }

                    let actual: Object | void;
                    if (step.instruction.kind === Kind.Action) {
                        actual = await timeout<Object | void>(`performing action . ${step.title}`, testee.timeout,
                            step.instruction.value.act(testee)).catch((err) => {
                            result.error(err);
                        });
                    } else {
                        actual = await testee.recoverable(testee, step.instruction.value, map,
                            (testee, req, map) => timeout<Object | void>(`sending instruction ${req.type}`, testee.timeout,
                                testee.testbed!.sendRequest(map, req)),
                            (testee) => testee.run(`Recover: re-initialize ${testee.testbed?.name}`, testee.connector.timeout, async function () {
                                await testee.initialize(description.program, description.args ?? []).catch((o) => {
                                    return Promise.reject(o)
                                });
                            }), 1).catch((e: Error) => {
                            result.completion = (e.message.includes('timeout')) ? Completion.timedout : Completion.error;
                            result.description = e.message;
                        });
                    }

                    if (result.completion === Completion.uncommenced) {
                        result = expect(step, actual, previous);
                    }

                    if (actual !== undefined) {
                        previous = actual;
                    }

                    testee.states.set(description.title, result);
                    scenarioResult.results.push(result);
                });
            }
            suiteResult.scenarios.push(scenarioResult);
        }
    }

    private async recoverable(testee: Testee, step: Request<any>, map: SourceMap.Mapping,
        attempt: (t: Testee, req: Request<any>, m: SourceMap.Mapping) => Promise<Object | void>,
        recover: (t: Testee) => Promise<any>,
        retries: number = 0): Promise<Object | void> {
        let result: Object | void = undefined;
        let error;
        while (0 <= retries && result === undefined) {
            result = await attempt(testee, step, map).catch(async (err) => {
                error = err;
                await recover(testee);
            });
            retries--;
        }
        return (result === undefined) ? Promise.reject(error) : result;
    }

    public skipall(): Testee {
        // this.suiteFunction = describe.skip; todo
        return this;
    };

    private async reset(instance: Testbed | void) {
        if (instance === undefined) {
            this.framework.reporter.error('Cannot run test: no debugger connection.'); // todo
        } else {
            await timeout<Object | void>('resetting vm', this.timeout, this.testbed!.sendRequest(new SourceMap.Mapping(), Message.reset));
        }
    }


    private formatTitle(title: string): string {
        return `${this.name}: ${title}`; // TODO unify with testbed and use testbed name?
    }

    private failedDependencies(description: TestScenario): TestScenario[] {
        return (description?.dependencies ?? []).filter(dependence => {
            if (this.states.get(dependence.title)) {
                const c = this.states.get(dependence.title)!.completion;
                return !(c === Completion.succeeded || c === Completion.uncommenced);
            } else {
                return false;
            }
        });
    }
}
