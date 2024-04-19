import {assert, expect} from 'chai';
import 'mocha';
import {after, describe, PendingSuiteFunction, SuiteFunction} from 'mocha';
import {Framework} from './Framework';
import {Action} from './scenario/Actions';
import {SourceMap} from '../sourcemap/SourceMap';
import {Message} from '../messaging/Message';
import {Testee} from '../testbeds/Testee';
import {TesteeFactory} from '../testbeds/TesteeFactory';
import {Behaviour, Description, Expectation, Kind, Step} from './scenario/Step';
import {SourceMapFactory} from '../sourcemap/SourceMapFactory';
import {TestScenario} from './scenario/TestScenario';
import {TesteeSpecification} from '../testbeds/TesteeSpecification';
import {Scheduler} from './Scheduler';
import {CompileOutput, CompilerFactory} from '../manage/Compiler';
import {WABT} from '../util/env';

function timeout<T>(label: string, time: number, promise: Promise<T>): Promise<T> {
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

export interface TestBed {
    readonly name: string;

    readonly timeout: number;

    testee: Testee;

    tests(): TestScenario[];

    scheduler: Scheduler;

    initialize(program: string, args: string[]): Promise<TestBed>;

    describe(description: TestScenario, runs: number): void;

    shutdown(): Promise<void>;

}

abstract class WARDuinoTestBed implements TestBed { // TODO unified with testee interface?

    abstract tests(): TestScenario[];

    /** The current state for each described test */
    private states: Map<string, string> = new Map<string, string>();

    /** Factory to establish new connections to VMs */
    public readonly connectionTimeout: number;

    public readonly mapper: SourceMapFactory;

    public readonly specification: TesteeSpecification;

    public readonly timeout: number;

    private framework: Framework;

    private suiteFunction: SuiteFunction | PendingSuiteFunction = describe;

    private readonly maximumConnectAttempts = 5;

    public readonly name: string;

    public scheduler: Scheduler;

    public testee: Testee;

    constructor(name: string, specification: TesteeSpecification, scheduler: Scheduler, timeout: number, connectionTimeout: number) {
        this.name = name;
        this.specification = specification;
        this.scheduler = scheduler;
        this.timeout = timeout;
        this.connectionTimeout = connectionTimeout;
        this.mapper = new SourceMapFactory();
        this.framework = Framework.getImplementation();
        this.testee = new TesteeFactory(0).build(specification);
    }

    public async initialize(program: string, args: string[]): Promise<TestBed> {
        return new Promise(async (resolve, reject) => {
            await this.testee.connect(this.connectionTimeout, program, args ?? []).catch((e) => {
                reject(e)
            });
            resolve(this);
        });
    }

    public async shutdown(): Promise<void> {
        return this.testee?.kill();
    }

    public describe(description: TestScenario, runs: number = 1) {
        const testee = this;
        const call: SuiteFunction | PendingSuiteFunction = description.skip ? describe.skip : this.suiteFunction;

        call(this.formatTitle(description.title), function () {
            this.timeout(testee.timeout * 1.1);  // must be larger than own timeout

            let map: SourceMap.Mapping = new SourceMap.Mapping();

            /** Each test requires some housekeeping before and after */
            before('Check for failing dependencies', async function () {
                const failedDependencies: TestScenario[] = testee.failedDependencies(description);
                if (failedDependencies.length > 0) {
                    throw new Error(`Skipped: failed dependent tests: ${failedDependencies.map(dependence => dependence.title)}`);
                }
            });

            before('Compile and upload program', async function () {
                this.timeout(testee.timeout);
                let compiled: CompileOutput = await new CompilerFactory(WABT).pickCompiler(description.program).compile(description.program);
                try {
                    await timeout<Object | void>(`uploading module`, testee.timeout, testee.testee!.sendRequest(new SourceMap.Mapping(), Message.updateModule(compiled.file))).catch((e) => Promise.reject(e));
                } catch (e) {
                    await testee.initialize(description.program, description.args ?? []).catch((o) => Promise.reject(o));
                }
            });

            before('Fetch source map', async function () {
                this.timeout(testee.timeout);
                map = await testee.mapper.map(description.program);
            });

            afterEach('Clear listeners on interface', function () {
                // after each step: remove the installed listeners
                // (describer.instance as Platform)?.deafen(); // TODO works without it? should not be necessary with new requests
            });

            after('Update state of test scenario', async function () {
                testee.states.set(description.title, this.currentTest?.state ?? 'unknown');
            });

            /** Each test is made of one or more scenario */

            let previous: any = undefined;
            for (let i = 0; i < runs; i++) {
                if (0 < i) {
                    it('resetting before retry', async function () {
                        await testee.reset(testee.testee);
                    });
                }

                for (const step of description.steps ?? []) {
                    /** Perform the step and check if expectations were met */

                    it(step.title, async function () {
                        if (testee.testee === undefined) {
                            assert.fail('Cannot run test: no debugger connection.');
                            return;
                        }

                        let actual: Object | void;
                        if (step.instruction.kind === Kind.Action) {
                            actual = await timeout<Object | void>(`performing action . ${step.title}`, testee.timeout,
                                step.instruction.value.act(testee));
                        } else {
                            actual = await timeout<Object | void>(`sending instruction ${step.instruction.value.type}`, testee.timeout,
                                testee.testee.sendRequest(map, step.instruction.value));
                        }

                        for (const expectation of step.expected ?? []) {
                            testee.expect(expectation, actual, previous);
                        }

                        if (actual !== undefined) {
                            previous = actual;
                        }
                    });
                }
            }
        });
    }

    public skipall(): TestBed {
        this.suiteFunction = describe.skip;
        return this;
    };

    private async reset(instance: Testee | void) {
        if (instance === undefined) {
            assert.fail('Cannot run test: no debugger connection.');
        } else {
            await timeout<Object | void>('resetting vm', this.timeout, this.testee!.sendRequest(new SourceMap.Mapping(), Message.reset));
        }
    }


    private formatTitle(title: string): string {
        return `${this.name}: ${title}`; // TODO unify with testbed and use testbed name?
    }

    private failedDependencies(description: TestScenario): TestScenario[] {
        return (description?.dependencies ?? []).filter(dependence => this.states.get(dependence.title) !== 'passed');
    }

    private expect(expectation: Expectation, actual: any, previous: any): void {
        for (const [field, entry] of Object.entries(expectation)) {
            const value = getValue(actual, field);
            if (value === undefined) {
                assert.fail(`Failure: ${JSON.stringify(actual)} state does not contain '${field}'.`);
                return;
            }

            if (entry.kind === 'primitive') {
                this.expectPrimitive(value, entry.value);
            } else if (entry.kind === 'description') {
                this.expectDescription(value, entry.value);
            } else if (entry.kind === 'comparison') {
                this.expectComparison(actual, value, entry.value, entry.message);
            } else if (entry.kind === 'behaviour') {
                if (previous === undefined) {
                    assert.fail('Invalid test: no [previous] to compare behaviour to.');
                    return;
                }
                this.expectBehaviour(value, getValue(previous, field), entry.value);
            }
        }
    }

    private expectPrimitive<T>(actual: T, expected: T): void {
        expect(actual).to.deep.equal(expected);
    }

    private expectDescription<T>(actual: T, value: Description): void {
        switch (value) {
            case Description.defined:
                expect(actual).to.exist;
                break;
            case Description.notDefined:
                expect(actual).to.be.undefined;
                break;
        }
    }

    private expectComparison<T>(state: Object, actual: T, comparator: (state: Object, value: T) => boolean, message?: string): void {
        expect(comparator(state, actual), `compare ${actual} with ${comparator}`).to.equal(true, message ?? 'custom comparator failed');
    }

    private expectBehaviour(actual: any, previous: any, behaviour: Behaviour): void {
        switch (behaviour) {
            case Behaviour.unchanged:
                expect(actual).to.be.equal(previous);
                break;
            case Behaviour.changed:
                expect(actual).to.not.equal(previous);
                break;
            case Behaviour.increased:
                expect(actual).to.be.greaterThan(previous);
                break;
            case Behaviour.decreased:
                expect(actual).to.be.lessThan(previous);
                break;
        }
    }
}

export class SingleDeviceTestBed extends WARDuinoTestBed implements TestBed {
    private scenarios: TestScenario[] = [];

    public tests(): TestScenario[] {
        return this.scenarios;
    }

    public test(test: TestScenario) {
        this.scenarios.push(test);
    }
}

interface TesteeStep extends Step {
    testee: Testee;  // TODO I can probably make this an optional field in Step
}

interface OutOfPlaceScenario extends TestScenario {
    steps?: TesteeStep[];
}

export class OutOfPlaceTestBed extends WARDuinoTestBed implements TestBed {
    private scenarios: TestScenario[] = [];

    public proxy: Testee;

    constructor(name: string, specification: TesteeSpecification, proxySpecification: TesteeSpecification, scheduler: Scheduler, timeout: number, connectionTimeout: number) {
        super(name, specification, scheduler, timeout, connectionTimeout);
        this.proxy = new TesteeFactory(0).build(proxySpecification);
    }

    public tests(): TestScenario[] {
        return this.scenarios;
    }

    public test(test: (testee: Testee, proxy: Testee) => TestScenario) {
        if (this.testee && this.proxy) {
            this.scenarios.push(test(this.testee, this.proxy));
        }
    }

    public async initialize(program: string, args: string[]): Promise<TestBed> {

        return new Promise(async (resolve, reject) => {
            await this.proxy.connect(this.connectionTimeout, program, args ?? []).catch((e) => {
                reject(e)
            });

            await this.testee.connect(this.connectionTimeout, program, args ?? []).catch((e) => {
                reject(e)
            });

            resolve(this);
        });
    }
}