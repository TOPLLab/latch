import {Result, StepOutcome} from '../Results';
import {blue, bold, green, inverse, red, yellow} from 'ansi-colors';

const plain = {
    bullet: '● ',
    emph: (s: string) => bold(s),
    colors: {
        highlight: (s: string) => bold(blue(s)),
        success: (s: string) => inverse(bold(green(s))),
        skipped: (s: string) => inverse(bold(yellow(s))),
        failure: (s: string) => inverse(bold(red(s))),
        failureMessage: (s: string) => red(s),
        error: (s: string) => inverse(bold(red(s)))
    },
    labels: {
        suiteSuccess: ' PASSED ',
        suiteSkipped: ' SKIPPED ',
        success: ' PASS ',
        skipped: ' SKIP ',
        timeout: ' TIMEOUT ',
        failure: ' FAIL ',
        error: ' ERROR '
    }
};

export function plainReporting() {
    return plain;
}

export interface Describable<R extends Result> {
    readonly item: R;

    describe(): string[];
}

export abstract class Describer<R extends Result> implements Describable<R> {
    public readonly item: R;

    constructor(item: R) {
        this.item = item;
    }

    abstract describe(): string[];
}

export class SilentDescriber<R extends Result> extends Describer<R> {
    describe(): string[] {
        return [];
    }
}

export class StepDescriber extends Describer<StepOutcome> {
    constructor(outcome: Result) {
        super(outcome);
    }

    describe(): string[] {
        switch (this.item.outcome) {
            case Outcome.succeeded:
                return [`${plain.colors.success(plain.labels.success)} ${this.item.name}`];
            case Outcome.uncommenced:
            case Outcome.skipped:
                return [`${plain.colors.skipped(plain.labels.skipped)} ${this.item.name}`];
            case Outcome.timedout:
                return [`${plain.colors.failure(plain.labels.timeout)} ${this.item.name}`];
            case Outcome.error:
            case Outcome.failed:
            default:
                return [`${plain.colors.failure(plain.labels.failure)} ${this.item.name}\n        ${plain.colors.failureMessage(this.item.outcome + this.item.clarification)}`];
        }
    }
}

export enum Outcome {
    uncommenced = 'not started',  // test hasn't started
    succeeded = 'success',        // test succeeded
    failed = 'failure: ',         // test failed
    timedout = 'timed out',       // test failed
    error = 'error: ',            // test was unable to complete
    skipped = 'skipped'           // test has failing dependencies
}

// const r Result = expect(e: Expected) <-- replaces the function in Testee todo
