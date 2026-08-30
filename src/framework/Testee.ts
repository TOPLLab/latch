/* eslint-disable no-async-promise-executor, @typescript-eslint/no-this-alias */
import {Framework} from './Framework';
import {SourceMap} from '../sourcemap/SourceMap';
import {Message, Request} from '../messaging/Message';
import {Testbed, TestbedEvents} from '../testbeds/Testbed';
import {TestbedFactory} from '../testbeds/TestbedFactory';
import {Kind} from './scenario/Step';
import {SourceMapFactory} from '../sourcemap/SourceMapFactory';
import {TestScenario} from './scenario/TestScenario';
import {OutofPlaceSpecification, PlatformType, TestbedSpecification} from '../testbeds/TestbedSpecification';
import {CompileOutput, CompilerFactory} from '../manage/Compiler';
import {WABT} from '../util/env';
import {Outcome} from '../reporter/Outcome';
import {WASM} from '../sourcemap/Wasm';
import {DummyProxy} from '../testbeds/Emulator';
import {ScenarioResult, Skipped, StepOutcome, SuiteResult} from '../reporter/Results';
import {Verifier} from './Verifier';
import {stringify} from "../util/util";

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
    if (object?.type === WASM.Special.nothing) {
        return undefined;
    }

    // convert indexes to properties + remove leading dots
    field = field.replace(/\[(\w+)]/g, '.$1');
    field = field.replace(/^\.?/, '');

    for (const accessor of field.split('.')) {
        if (accessor in object) {
            object = object[accessor];
        } else {
            // specified field does not exist
            throw Error(`state does not contain field ${field}`);
        }
    }
    return object;
}

export enum Target {
    supervisor = 'supervisor',
    proxy = 'proxy'
}

export class Testee { // TODO unified with testbed interface

    /** The current state for each described test */
    private states: Map<string, StepOutcome> = new Map<string, StepOutcome>();

    /** Factory to establish new connections to VMs */
    public readonly connector: TestbedFactory;

    public readonly mapper: SourceMapFactory;

    public readonly specification: TestbedSpecification;

    public readonly timeout: number;

    private framework: Framework;

    private readonly maximumConnectAttempts = 5;

    public readonly name: string;

    private testbed?: Testbed;

    private proxy?: DummyProxy;

    private current?: string; // current program

    constructor(name: string, specification: TestbedSpecification, timeout: number, connectionTimeout: number) {
        this.name = name;
        this.specification = specification;
        this.timeout = timeout;
        this.mapper = new SourceMapFactory();
        this.framework = Framework.getImplementation();
        this.connector = new TestbedFactory(connectionTimeout, (chunk: Buffer) => this.framework.reporter.debug(chunk.toString()));
    }

    public bed(target: Target = Target.supervisor): Testbed | void {
        return target == Target.proxy ? this.proxy : this.testbed;
    }

    public async initialize(program: string, args: string[] = []): Promise<Testee> {
        return new Promise(async (resolve, reject) => {
            if (this.specification.type === PlatformType.emu2emu) {
                const spec = (this.specification as OutofPlaceSpecification).proxy;
                const proxy: Testbed | void = await this.connector.initialize(spec, program, args ?? []).catch((e) => {
                    reject(e)
                });

                if (!proxy) {
                    return;
                }

                this.proxy = proxy as DummyProxy;
                this.proxy.on(TestbedEvents.Ready, () => {
                    resolve(this);
                });
                await this.proxy.sendRequest(new SourceMap.Mapping(), Message.proxifyRequest);
                args = args.concat(['--proxy', `${spec.dummy.port}`]);

                const testbed: Testbed | void = await this.connector.initialize(this.specification, program, args).catch((e) => {
                    reject(e);
                });
                if (testbed) {
                    this.testbed = testbed;
                }
            } else {
                const testbed: Testbed | void = await this.connector.initialize(this.specification, program, args).catch((e) => {
                    reject(e)
                });
                if (testbed) {
                    this.testbed = testbed;
                }
                resolve(this);
            }
        });
    }

    public async shutdown(): Promise<void> {
        await this.proxy?.kill();
        return this.testbed?.kill();
    }

    private run(name: string, limit: number, fn: () => Promise<any>) {
        return timeout<object | void>(name, limit, fn());
    }

    private step(name: string, limit: number, fn: () => Promise<any>) {
        return timeout<object | void>(name, limit, fn());
    }

    public async describe(description: TestScenario, suiteResult: SuiteResult, runId: string, runs: number = 1) {
        const testee = this;
        const scenarioResult: ScenarioResult = new ScenarioResult(description);
        const reporter = this.framework.reporter;
        let addedToSuite = false;

        const addScenario = () => {
            if (!addedToSuite) {
                suiteResult.add(scenarioResult);
                addedToSuite = true;
            }
        };

        const addStep = (result: StepOutcome) => {
            scenarioResult.add(result);
            reporter.stepFinished(runId, scenarioResult, result);
        };
        const scenarioHasError = () => scenarioResult.outcome === Outcome.error;

        reporter.scenarioStarted(runId, scenarioResult);

        if (description.skip) {
            scenarioResult.update(Outcome.skipped, 'Skipped by scenario configuration');
            addScenario();
            reporter.scenarioFinished(runId, scenarioResult);
            return;
        }

        try {
            // call(this.formatTitle(description.title), function () {
            let map: SourceMap.Mapping = new SourceMap.Mapping();

            /** Each test requires some housekeeping before and after */
            await this.run('Check for failing dependencies', testee.timeout, async function () {
                const failedDependencies: TestScenario[] = testee.failedDependencies(description);
                if (failedDependencies.length > 0) {
                    testee.states.set(description.title, new Skipped('Skipping', 'Test has failing dependencies'));
                    throw new Error(`Skipped: failed dependent tests: ${failedDependencies.map(dependence => dependence.title)}`);
                }
            }).catch((e: Error) => {
                scenarioResult.error(e.message);
            });

            if (scenarioHasError()) {
                addScenario();
                return;
            }

            await this.run('Compile and upload program', testee.connector.timeout, async function () {
                if (testee.current === description.program) {
                    await testee.reset(testee.testbed);
                    return;
                }

                const compiled: CompileOutput = await new CompilerFactory(WABT).pickCompiler(description.program).compile(description.program);
                try {
                    await timeout<object | void>(`uploading module`, testee.timeout, testee.bed()!.sendRequest(new SourceMap.Mapping(), Message.updateModule(compiled.file))).catch((e) => Promise.reject(e));
                    testee.current = description.program;
                } catch {
                    await testee.shutdown();
                    await testee.initialize(description.program, description.args ?? []).catch((o) => Promise.reject(o));
                }
            }).catch((e: Error | string) => {
                if (typeof e === 'string') {
                    scenarioResult.error(e);
                } else {
                    scenarioResult.error(e.toString());
                }
            });

            if (scenarioHasError()) {
                addScenario();
                return;
            }

            await this.run('Get source mapping', testee.connector.timeout, async function () {
                map = await testee.mapper.map(description.program);
            }).catch((e: Error | string) => {
                if (typeof e === 'string') {
                    scenarioResult.error(e);
                } else {
                    scenarioResult.error(e.toString());
                }
            });

            if (scenarioHasError()) {
                addScenario();
                return;
            }

            /** Each test is made of one or more scenario */

            let previous: any = undefined;
            for (let i = 0; i < runs; i++) {
                if (0 < i) {
                    await this.run('resetting before retry', testee.timeout, async function () {
                        await testee.reset(testee.testbed);
                    }).catch((e: Error) => {
                        scenarioResult.error(e.toString());
                    });
                }

                for (const step of description.steps ?? []) {
                    const verifier: Verifier = new Verifier(step);
                    let stepRecorded = false;
                    const recordStep = (result: StepOutcome) => {
                        if (!stepRecorded) {
                            stepRecorded = true;
                            addStep(result);
                        }
                    };

                    /** Perform the step and check if expectations were met */
                    await this.step(step.title, testee.timeout, async function () {
                        if (testee.bed(step.target ?? Target.supervisor) === undefined) {
                            const result = verifier.error('Cannot run test: no debugger connection.');
                            testee.states.set(description.title, result);
                            recordStep(result);
                            return;
                        }

                        let actual: object | void;
                        if (step.instruction.kind === Kind.Action) {
                            actual = await timeout<object | void>(`performing action . ${step.title}`, testee.timeout,
                                step.instruction.value.act(testee)).catch((err) => {
                                const result = verifier.error(stringify(err));
                                testee.states.set(description.title, result);
                                recordStep(result);
                                return;
                            });
                        } else {
                            actual = await testee.recoverable(testee, step.instruction.value, map,
                                (testee, req, map) => timeout<object | void>(`sending instruction ${req.type}`, testee.timeout,
                                    testee.bed(step.target ?? Target.supervisor)!.sendRequest(map, req)),
                                (testee) => testee.run(`Recover: re-initialize ${testee.testbed?.name}`, testee.connector.timeout, async function () {
                                    await testee.initialize(description.program, description.args ?? []).catch((o) => {
                                        return Promise.reject(o)
                                    });
                                }), 1).catch((e: unknown) => {
                                const result = new StepOutcome(step);
                                const error = e instanceof Error ? e.toString() : String(e);
                                testee.states.set(description.title, result.update((error.includes('timeout')) ? Outcome.timedout : Outcome.error, error));
                                recordStep(result);
                            });
                        }

                        if (stepRecorded) {
                            return;
                        }

                        const result = verifier.verify(actual, previous);

                        if (actual !== undefined) {
                            previous = actual;
                        }

                        testee.states.set(description.title, result);
                        recordStep(result);
                    }).catch((error: Error | string) => {
                        const result = verifier.error(stringify(error));
                        testee.states.set(description.title, result);
                        recordStep(result);
                    });
                }
            }
            addScenario();
        } finally {
            reporter.scenarioFinished(runId, scenarioResult);
        }
    }

    /* eslint @typescript-eslint/no-explicit-any: off */
    private async recoverable(testee: Testee, step: Request<any>, map: SourceMap.Mapping,
        attempt: (t: Testee, req: Request<any>, m: SourceMap.Mapping) => Promise<object | void>,
        recover: (t: Testee) => Promise<any>,
        retries: number = 0): Promise<object | void> {
        let result: object | void = undefined;
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
            await timeout<object | void>('resetting vm', this.timeout, this.testbed!.sendRequest(new SourceMap.Mapping(), Message.reset));
        }
    }


    private formatTitle(title: string): string {
        return `${this.name}: ${title}`; // TODO unify with testbed and use testbed name?
    }

    private failedDependencies(description: TestScenario): TestScenario[] {
        return (description?.dependencies ?? []).filter(dependence => {
            if (this.states.get(dependence.title)) {
                const c = this.states.get(dependence.title)!.outcome;
                return !(c === Outcome.succeeded || c === Outcome.uncommenced);
            } else {
                return false;
            }
        });
    }
}
