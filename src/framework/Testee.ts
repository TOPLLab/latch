import {Framework} from './Framework';
import {SourceMap} from '../sourcemap/SourceMap';
import {Message} from '../messaging/Message';
import {Testbed} from '../testbeds/Testbed';
import {TestbedFactory} from '../testbeds/TestbedFactory';
import {Kind} from './scenario/Step';
import {SourceMapFactory} from '../sourcemap/SourceMapFactory';
import {TestScenario} from './scenario/TestScenario';
import {TestbedSpecification} from '../testbeds/TestbedSpecification';
import {Scheduler} from './Scheduler';
import {CompileOutput, CompilerFactory} from '../manage/Compiler';
import {WABT} from '../util/env';
import {Completion, expect, Reporter, Result} from './Reporter';

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

    public scheduler: Scheduler;

    public testbed?: Testbed;

    public reporter = new Reporter();

    constructor(name: string, specification: TestbedSpecification, scheduler: Scheduler, timeout: number, connectionTimeout: number) {
        this.name = name;
        this.specification = specification;
        this.scheduler = scheduler;
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

    public async describe(description: TestScenario, runs: number = 1) {
        const testee = this;

        if (description.skip) {
            return;
        }

        this.reporter.test(description.title);

        // call(this.formatTitle(description.title), function () {
        let map: SourceMap.Mapping = new SourceMap.Mapping();

        /** Each test requires some housekeeping before and after */
        await this.run('Check for failing dependencies', testee.timeout, async function () {
            const failedDependencies: TestScenario[] = testee.failedDependencies(description);
            if (failedDependencies.length > 0) {
                throw new Error(`Skipped: failed dependent tests: ${failedDependencies.map(dependence => dependence.title)}`);
            }
        });

        await this.run('Compile and upload program', testee.connector.timeout, async function () {
            let compiled: CompileOutput = await new CompilerFactory(WABT).pickCompiler(description.program).compile(description.program);
            try {
                await timeout<Object | void>(`uploading module`, testee.timeout, testee.testbed!.sendRequest(new SourceMap.Mapping(), Message.updateModule(compiled.file))).catch((e) => Promise.reject(e));
            } catch (e) {
                await testee.initialize(description.program, description.args ?? []).catch((o) => Promise.reject(o));
            }
        });

        await this.run('Compile and upload program', testee.connector.timeout, async function () {
            map = await testee.mapper.map(description.program);
        });

        /** Each test is made of one or more scenario */

        let previous: any = undefined;
        for (let i = 0; i < runs; i++) {
            if (0 < i) {
                await this.run('resetting before retry', testee.timeout, async function () {
                    await testee.reset(testee.testbed);
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
                        actual = await timeout<Object | void>(`sending instruction ${step.instruction.value.type}`, testee.timeout,
                            testee.testbed.sendRequest(map, step.instruction.value)).catch((err) => {
                            result.error(err);
                        });
                    }

                    if (result.completion === Completion.uncommenced) {
                        result = expect(step, actual, previous);
                    }

                    if (actual !== undefined) {
                        previous = actual;
                    }

                    testee.states.set(description.title, result);
                    testee.reporter.step(result);
                });
            }
        }
    }

    public skipall(): Testee {
        // this.suiteFunction = describe.skip; todo
        return this;
    };

    private async reset(instance: Testbed | void) {
        if (instance === undefined) {
            this.reporter.error('Cannot run test: no debugger connection.');
        } else {
            await timeout<Object | void>('resetting vm', this.timeout, this.testbed!.sendRequest(new SourceMap.Mapping(), Message.reset));
        }
    }


    private formatTitle(title: string): string {
        return `${this.name}: ${title}`; // TODO unify with testbed and use testbed name?
    }

    private failedDependencies(description: TestScenario): TestScenario[] {
        return (description?.dependencies ?? []).filter(dependence => this.states.get(dependence.title)?.completion !== Completion.succeeded);
    }
}
