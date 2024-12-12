import {Result, StepOutcome} from '../Results';
import {Style} from '../Style';

export interface Describable<R extends Result> {
    readonly item: R;

    describe(style: Style): string[];
}

export abstract class Describer<R extends Result> implements Describable<R> {
    public readonly item: R;

    constructor(item: R) {
        this.item = item;
    }

    abstract describe(style: Style): string[];
}

export class SilentDescriber<R extends Result> extends Describer<R> {
    describe(style: Style): string[] {
        return [];
    }
}

export class StepDescriber extends Describer<StepOutcome> {
    constructor(outcome: Result) {
        super(outcome);
    }

    describe(style: Style): string[] {
        switch (this.item.outcome) {
            case Outcome.succeeded:
                return [`${style.colors.success(style.labels.success)} ${this.item.name}`];
            case Outcome.uncommenced:
            case Outcome.skipped:
                return [`${style.colors.skipped(style.labels.skipped)} ${this.item.name}`];
            case Outcome.error:
            case Outcome.failed:
            default:
                return [`${style.colors.failure(style.labels.failure)} ${this.item.name}\n        ${style.colors.failureMessage(this.item.outcome + this.item.clarification)}`];
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

