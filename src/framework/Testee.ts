import {assert, expect} from 'chai';
import 'mocha';
import {after, describe, PendingSuiteFunction, SuiteFunction} from 'mocha';
import {Framework} from './Framework';
import {Action} from './scenario/Actions';
import {SourceMap} from '../sourcemap/SourceMap';
import {Message} from '../messaging/Message';
import {Testbed} from '../testbeds/Testbed';
import {TestbedFactory} from '../testbeds/TestbedFactory';
import {Behaviour, Description, Expectation, Kind} from './scenario/Step';
import {SourceMapFactory} from '../sourcemap/SourceMapFactory';
import {TestScenario} from './scenario/TestScenario';
import {TestbedSpecification} from '../testbeds/TestbedSpecification';
import {Scheduler} from './Scheduler';
import {CompileOutput, CompilerFactory} from '../manage/Compiler';
import {WABT} from '../util/env';

function timeout<T>(label: string, time: number, promise: Promise<T>): Promise<T> {
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

function act<T>(action: Action<T>): Promise<T> {
    return action();
}

export class Testee { // TODO unified with testbed interface

    /** The current state for each described test */
    private states: Map<string, string> = new Map<string, string>();

    /** Factory to establish new connections to VMs */
    public readonly connector: TestbedFactory;

    public readonly mapper: SourceMapFactory;

    public readonly specification: TestbedSpecification;

    public readonly timeout: number;

    private framework: Framework;

    private suiteFunction: SuiteFunction | PendingSuiteFunction = describe;

    private readonly maximumConnectAttempts = 5;

    public readonly name: string;

    public scheduler: Scheduler;

    public testbed?: Testbed;

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
            this.testbed = await this.connector.initialize(this.specification, program, args ?? []);
            resolve(this);
        });
    }

    public async shutdown(): Promise<void> {
        return this.testbed?.kill();
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
                this.timeout(testee.connector.timeout(testee.specification.type));
                let compiled: CompileOutput = await new CompilerFactory(WABT).pickCompiler(description.program).compile(description.program);
                try {
                     await timeout<Object | void>(`uploading module`, testee.timeout, testee.testbed!.sendRequest(new SourceMap.Mapping(), Message.updateModule(compiled.file)));
                } catch (e) {
                    await testee.initialize(description.program, description.args ?? []);
                }
            });

            before('Fetch source map', async function () {
                this.timeout(testee.connector.timeout(testee.specification.type));
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
                        await testee.reset(testee.testbed);
                    });
                }

                for (const step of description.steps ?? []) {
                    /** Perform the step and check if expectations were met */

                    it(step.title, async function () {
                        if (testee.testbed === undefined) {
                            assert.fail('Cannot run test: no debugger connection.');
                            return;
                        }

                        let actual: Object | void;
                        if (step.instruction.kind === Kind.Action) {
                            actual = await timeout<Object | void>(`performing action . ${step.title}`, testee.timeout,
                                act(step.instruction.value));
                        } else {
                            actual = await timeout<Object | void>(`sending instruction ${step.instruction.value.type}`, testee.timeout,
                                testee.testbed.sendRequest(map, step.instruction.value));
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

    public skipall(): Testee {
        this.suiteFunction = describe.skip;
        return this;
    };

    private async reset(instance: Testbed | void) {
        if (instance === undefined) {
            assert.fail('Cannot run test: no debugger connection.');
        } else {
            await timeout<Object | void>('resetting vm', this.timeout, this.testbed!.sendRequest(new SourceMap.Mapping(), Message.reset));
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
