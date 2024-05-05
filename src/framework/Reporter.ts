import {Framework, OutputStyle} from './Framework';
import {Behaviour, Description, Step} from './scenario/Step';
import {getValue, Testee} from './Testee';

// import {deepEqual} from 'deep-equal';

export enum Completion {
    uncommenced = 'not started',  // test hasn't started
    succeeded = 'success',        // test succeeded
    failed = 'failure: ',         // test failed
    error = 'error: '             // test was unable to complete
}

export function expect(step: Step, actual: Object | void, previous?: Object): Result {
    const result: Result = new Result(step.title, '');
    result.completion = Completion.succeeded;
    for (const expectation of step.expected ?? []) {
        for (const [field, entry] of Object.entries(expectation)) {
            const value = getValue(actual, field);
            if (value === undefined) {
                result.error(`Failure: ${JSON.stringify(actual)} state does not contain '${field}'.`);
                return result;
            }

            if (entry.kind === 'primitive') {
                result.expectPrimitive(value, entry.value);
            } else if (entry.kind === 'description') {
                result.expectDescription(value, entry.value);
            } else if (entry.kind === 'comparison') {
                result.expectComparison(actual, value, entry.value, entry.message);
            } else if (entry.kind === 'behaviour') {
                if (previous === undefined) {
                    result.error('Invalid test: no [previous] to compare behaviour to.');
                    return result;
                }
                result.expectBehaviour(value, getValue(previous, field), entry.value);
            }
        }
    }
    return result;
}

export class Result {
    public completion: Completion = Completion.uncommenced;  // completion status of the step
    public name: string; // name of the step
    public description: string;

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }

    toString(): string {
        return `${this.name}\n      ${this.completion}${this.description}`;
    }

    error(description: string) {
        this.completion = Completion.error;
        this.description = description;
    }

    public expectPrimitive<T>(actual: T, expected: T): void {
        // this.completion = deepEqual(actual, expected) ? Completion.succeeded : Completion.failed;
        if (actual === expected) {
            this.completion = Completion.succeeded;
        } else {
            this.completion = Completion.failed;
            this.description = `Expected ${expected} got ${actual}`;
        }
    }

    public expectDescription<T>(actual: T, value: Description): void {
        if ((value === Description.defined && actual !== undefined) ||
            value === Description.notDefined && actual === undefined) {
            this.completion = Completion.succeeded;
        } else {
            this.completion = Completion.failed;
            this.description = value === Description.defined ? 'Should exist' : 'Unexpected field';
        }
    }

    public expectComparison<T>(state: Object | void, actual: T, comparator: (state: Object, value: T) => boolean, message?: string): void {
        if (state === undefined) {
            this.completion = Completion.failed;
            this.description = `Got unexpected ${state}`;
            return;
        }

        if (comparator(state, actual)) {
            this.completion = Completion.succeeded;
        } else {
            this.completion = Completion.failed;
            this.description = 'custom comparator failed';
        }
    }

    public expectBehaviour(actual: any, previous: any, behaviour: Behaviour): void {
        switch (behaviour) {
            case Behaviour.unchanged:
                if (actual === previous) {
                    this.completion = Completion.succeeded;
                } else {
                    this.completion = Completion.failed;
                    this.description = `Expected ${actual} to equal ${previous}`
                }
                break;
            case Behaviour.changed:
                if (actual !== previous) {
                    this.completion = Completion.succeeded;
                } else {
                    this.completion = Completion.failed;
                    this.description = `Expected ${actual} to be different from ${previous}`
                }
                break;
            case Behaviour.increased:
                if (actual > previous) {
                    this.completion = Completion.succeeded;
                } else {
                    this.completion = Completion.failed;
                    this.description = `Expected ${actual} to be greater than ${previous}`
                }
                break;
            case Behaviour.decreased:
                if (actual < previous) {
                    this.completion = Completion.succeeded;
                } else {
                    this.completion = Completion.failed;
                    this.description = `Expected ${actual} to be less than ${previous}`
                }
                break;
        }
    }
}

// const r Result = expect(e: Expected) <-- replaces the function in Testee todo

export class Reporter {
    private output: string = '';

    constructor() {
    }

    report() {
        console.log(this.output);
    }

    style(style: OutputStyle) {
    }

    info(text: string) {
        this.output += `info: ${text}\n`;
    }

    error(text: string) {
        this.output += `error: ${text}\n`;
    }

    suite(title: string) {
        this.output += `suite: ${title}\n`;
    }

    test(title: string) {
        this.output += `  test: ${title}\n`;
    }

    step(result: Result) {
        this.output += `    ${result.toString()}\n`;
    }
}
