import {Behaviour, Description, Step} from './scenario/Step';
import {StepOutcome} from '../reporter/Results';
import {getValue} from './Testee';
import {Outcome} from '../reporter/describers/Describer';
import {bold} from 'ansi-colors';

// decorator for Step class
export class Verifier {
    public readonly step: Step;

    constructor(step: Step) {
        this.step = step;
    }

    public verify(actual: Object | void, previous?: Object): StepOutcome {
        let result = new StepOutcome(this.step).update(Outcome.succeeded);
        for (const expectation of this.step.expected ?? []) {
            for (const [field, entry] of Object.entries(expectation)) {
                try {
                    const value = getValue(actual, field);

                    if (entry.kind === 'primitive') {
                        result = this.expectPrimitive(value, entry.value);
                    } else if (entry.kind === 'description') {
                        result = this.expectDescription(value, entry.value);
                    } else if (entry.kind === 'comparison') {
                        result = this.expectComparison(actual, value, entry.value, entry.message);
                    } else if (entry.kind === 'behaviour') {
                        if (previous === undefined) {
                            return this.error('Invalid test: no [previous] to compare behaviour to.');
                        }
                        result = this.expectBehaviour(value, getValue(previous, field), entry.value);
                    }
                } catch {
                    return this.error(`Failure: ${JSON.stringify(actual)} state does not contain '${field}'.`);
                }

                if (result.outcome !== Outcome.succeeded) {
                    return result;
                }
            }
        }
        return result;
    }

    public error(clarification: string): StepOutcome {
        const result: StepOutcome = new StepOutcome(this.step);
        result.update(Outcome.succeeded);
        return result.update(Outcome.error, clarification);
    }

    private expectPrimitive<T>(actual: T, expected: T): StepOutcome {
        const result: StepOutcome = new StepOutcome(this.step);
        if (deepEqual(actual, expected)) {
            result.update(Outcome.succeeded);
        } else {
            result.update(Outcome.failed, `Expected ${bold(`${expected}`)} got ${bold(`${actual}`)}`);
        }
        return result;
    }

    private expectDescription<T>(actual: T, value: Description): StepOutcome {
        const result: StepOutcome = new StepOutcome(this.step);
        if ((value === Description.defined && actual !== undefined) ||
            value === Description.notDefined && actual === undefined) {
            result.update(Outcome.succeeded);
        } else {
            result.update(Outcome.failed, value === Description.defined ? 'Should exist' : 'Unexpected field');
        }
        return result;
    }

    private expectComparison<T>(state: Object | void, actual: T, comparator: (state: Object, value: T) => boolean, message?: string): StepOutcome {
        const result: StepOutcome = new StepOutcome(this.step);
        if (state === undefined) {
            result.update(Outcome.failed, `Got unexpected ${state}`);
            return result;
        }

        if (comparator(state, actual)) {
            result.update(Outcome.succeeded);
        } else {
            result.update(Outcome.failed, `Fail: ${message}`);
        }

        return result;
    }

    private expectBehaviour(actual: any, previous: any, behaviour: Behaviour): StepOutcome {
        const result: StepOutcome = new StepOutcome(this.step);
        switch (behaviour) {
        case Behaviour.unchanged:
            if (deepEqual(actual, previous)) {
                result.update(Outcome.succeeded);
            } else {
                result.update(Outcome.failed, `Expected ${actual} to equal ${previous}`);
            }
            break;
        case Behaviour.changed:
            if (!deepEqual(actual, previous)) {
                result.update(Outcome.succeeded);
            } else {
                result.update(Outcome.failed, `Expected ${actual} to be different from ${previous}`);
            }
            break;
        case Behaviour.increased:
            if (actual > previous) {
                result.update(Outcome.succeeded);
            } else {
                result.update(Outcome.failed, `Expected ${actual} to be greater than ${previous}`);
            }
            break;
        case Behaviour.decreased:
            if (actual < previous) {
                result.update(Outcome.succeeded);
            } else {
                result.update(Outcome.failed, `Expected ${actual} to be less than ${previous}`);
            }
            break;
        }
        return result;
    }
}

/* eslint @typescript-eslint/no-explicit-any: off */
function deepEqual(a: any, b: any): boolean {
    return a === b || (isNaN(a) && isNaN(b));
}
