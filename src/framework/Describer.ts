import {assert, expect} from 'chai';
import 'mocha';
import {after, describe, PendingSuiteFunction, SuiteFunction} from 'mocha';
import {Framework} from './Framework';
import {Action} from './scenario/Actions';
import {SourceMap} from '../sourcemap/SourceMap';
import {Message} from '../messaging/Message';
import {Testee} from '../testee/Testee';
import {PlatformFactory} from '../testee/PlatformFactory';
import {Behaviour, Description, Expectation, Kind} from './scenario/Step';
import {SourceMapFactory} from '../sourcemap/SourceMapFactory';
import {TestScenario} from './scenario/TestScenario';
import {PlatformSpecification, PlatformType} from '../testee/PlatformSpecification';

export function timeout<T>(label: string, time: number, promise: Promise<T>): Promise<T> {
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

export class Describer { // TODO unified with testbed interface

    /** The current state for each described test */
    private states: Map<string, string> = new Map<string, string>();

    /** Factory to establish new connections to VMs */
    public readonly connector: PlatformFactory;

    public readonly mapper: SourceMapFactory;

    public readonly specification: PlatformSpecification;

    public readonly timeout: number;

    private framework: Framework;

    private suiteFunction: SuiteFunction | PendingSuiteFunction = describe;

    private readonly maximumConnectAttempts = 5;

    public testee?: Testee;

    constructor(specification: PlatformSpecification, timeout: number = 2000) {
        this.specification = specification;
        this.timeout = timeout;
        this.connector = new PlatformFactory();
        this.mapper = new SourceMapFactory();
        this.framework = Framework.getImplementation();
    }

    public describeTest(description: TestScenario, runs: number = 1) {
        const describer = this;
        const call: SuiteFunction | PendingSuiteFunction = description.skip ? describe.skip : this.suiteFunction;

        call(this.formatTitle(description.title), function () {
            this.timeout(describer.timeout * 1.1);  // must be larger than own timeout

            let map: SourceMap.Mapping = new SourceMap.Mapping();

            /** Each test requires some housekeeping before and after */

            before('Connect to debugger', async function () {
                this.timeout(describer.connector.connectionTimeout);

                const failedDependencies: TestScenario[] = describer.failedDependencies(description);
                if (failedDependencies.length > 0) {
                    throw new Error(`Skipped: failed dependent tests: ${failedDependencies.map(dependence => dependence.title)}`);
                }

                describer.testee = await describer.connector.connect(describer.specification, description.program, description.args ?? []);
            });

            before('Fetch source map', async function () {
                this.timeout(describer.connector.connectionTimeout);
                map = await describer.mapper.map(description.program);
            });

            afterEach('Clear listeners on interface', function () {
                // after each step: remove the installed listeners
                // (describer.instance as Platform)?.deafen(); // TODO works without it? should not be necessary with new requests
            });

            after('Update state of test scenario', async function () {
                describer.states.set(description.title, this.currentTest?.state ?? 'unknown');
            });

            /** Each test is made of one or more scenario */

            let previous: any = undefined;
            for (let i = 0; i < runs; i++) {
                if (0 < i) {
                    it('resetting before retry', async function () {
                        await describer.reset(describer.testee);
                    });
                }

                for (const step of description.steps ?? []) {
                    /** Perform the step and check if expectations were met */

                    it(step.title, async function () {
                        if (describer.testee === undefined) {
                            assert.fail('Cannot run test: no debugger connection.');
                            return;
                        }

                        let actual: Object | void;
                        if (step.instruction.kind === Kind.Action) {
                            actual = await timeout<Object | void>(`performing action . ${step.title}`, describer.timeout,
                                act(step.instruction.value));
                        } else {
                            actual = await timeout<Object | void>(`sending instruction ${step.instruction}`, describer.timeout,
                                describer.testee.sendRequest(map, step.instruction.value));
                        }

                        for (const expectation of step.expected ?? []) {
                            describer.expect(expectation, actual, previous);
                        }

                        if (actual !== undefined) {
                            previous = actual;
                        }
                    });
                }
            }
        });
    }

    private async reset(instance: Testee | void) {
        if (instance === undefined) {
            assert.fail('Cannot run test: no debugger connection.');
        } else {
            await timeout<Object | void>('resetting vm', this.timeout, this.testee!.sendRequest(new SourceMap.Mapping(), Message.reset));
        }
    }

    public skipall(): Describer {
        this.suiteFunction = describe.skip;
        return this;
    };

    private formatTitle(title: string): string {
        return `${this.testee?.name}: ${title}`; // TODO unify with testbed and use testbed name?
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

function act<T>(action: Action<T>): Promise<T> {
    return action();
}