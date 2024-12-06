import {bold, green, inverse, red, reset, yellow} from 'ansi-colors';
import {indent} from '../util/printing';
import {Behaviour, Description} from '../framework/scenario/Step';
import {Completion} from './Reporter';

export class Result {
    public completion: Completion;  // completion status of the step
    public name: string; // name of the step
    public description: string;

    constructor(name: string, description: string, completion?: Completion) {
        this.name = name;
        this.description = description;
        this.completion = completion ?? Completion.uncommenced;
    }

    report(level: number) {
        console.log(reset(`${indent(level)}${this}`));
    }

    toString(): string {
        switch (this.completion) {
        case Completion.succeeded:
            return `${bold(inverse(green(' PASS ')))} ${this.name}`;
        case Completion.uncommenced:
            return `${bold(inverse(yellow(' SKIP ')))} ${this.name}`;
        case Completion.error:
        case Completion.failed:
        default:
            return `${bold(inverse(red(' FAIL ')))} ${this.name}\n        ${red(this.completion)}${red(this.description)}`;

        }
    }

    error(description: string) {
        this.completion = Completion.error;
        this.description = description;
    }

    public expectPrimitive<T>(actual: T, expected: T): void {
        // this.completion = deepEqual(actual, expected) ? Completion.succeeded : Completion.failed;
        if (deepEqual(actual, expected)) {
            this.completion = Completion.succeeded;
        } else {
            this.completion = Completion.failed;
            this.description = `Expected ${bold(`${expected}`)} got ${bold(`${actual}`)}`;
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
            if (deepEqual(actual, previous)) {
                this.completion = Completion.succeeded;
            } else {
                this.completion = Completion.failed;
                this.description = `Expected ${actual} to equal ${previous}`
            }
            break;
        case Behaviour.changed:
            if (!deepEqual(actual, previous)) {
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

function deepEqual(a: any, b: any): boolean {
    return a === b || (isNaN(a) && isNaN(b));
}
