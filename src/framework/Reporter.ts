import {Framework, OutputStyle, Suite} from './Framework';
import {Behaviour, Description, Step} from './scenario/Step';
import {getValue, Testee} from './Testee';
import * as chalk from 'chalk';
import {Archiver} from './Archiver';

// import {deepEqual} from 'deep-equal';

export enum Completion {
    uncommenced = 'not started',  // test hasn't started
    succeeded = 'success',        // test succeeded
    failed = 'Failure: ',         // test failed
    timedout = 'timed out',         // test failed
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

export class SuiteResults {
    public suite: Suite;
    public testee: Testee;
    public results: Result[] = [];

    constructor(suite: Suite, testee: Testee) {
        this.suite = suite;
        this.testee = testee;
    }

    title(): string {
        return `${this.testee.name}: ${this.suite.title}`;
    }

    steps(): string[] {
        return this.results.map((result) => result.toString());
    }

    passing(): boolean {
        return this.results.every((result) => result.completion === Completion.succeeded);
    }

    failing(): boolean {
        return this.results.some((result) => result.completion === Completion.failed);
    }

    skipped(): boolean {
        return this.results.every((result) => result.completion === Completion.uncommenced);
    }
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
        switch (this.completion) {
            case Completion.succeeded:
                return `${chalk.hex('#40a02b')('✔')} ${this.name}`;
            case Completion.uncommenced:
                return `${this.name}: skipped`;
            case Completion.error:
            case Completion.failed:
            default:
                return `${chalk.hex('#e64553')('✖')} ${this.name}\n        ${chalk.hex('#e64553')(this.completion)}${chalk.hex('#e64553')(this.description)}`;

        }
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
            this.description = `Expected ${chalk.bold(expected)} got ${chalk.bold(actual)}`;
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

    private readonly indentationSize: number = 2;
    private indentationLevel: number = 2;

    private suites: SuiteResults[] = [];

    private archiver: Archiver;

    constructor() {
        this.archiver = new Archiver(`${process.env.TESTFILE?.replace('.asserts.wast', '.wast') ?? 'suite'}.${Date.now()}.log`);
        this.archiver.set('date', new Date(Date.now()).toISOString());
    }

    private indent(override?: number): string {
        return ' '.repeat((override ?? this.indentationLevel) * this.indentationSize);
    }

    general() {
        console.log(chalk.hex('#8839EF')(`${this.indent()}General Information`));
        console.log(chalk.hex('#8839EF')(`${this.indent()}===================`));
        console.log(chalk.hex('#8839EF')(`${this.indent()}VM commit  ${'47a672e'}`));
        console.log();
    }

    report(suiteResult: SuiteResults) {
        this.suites.push(suiteResult);
        console.log(chalk.hex('#8839EF')(`${this.indent()}${suiteResult.title()}`));
        this.indentationLevel += 1;
        suiteResult.steps().forEach((result) => {
            console.log(chalk.black(`${this.indent()}${result}`));
        });
        this.indentationLevel -= 1;
        console.log();
    }

    results(time: number) {
        this.archiver.set('duration (ms)', Math.round(time));

        let passing = this.suites.filter((suite) => suite.passing()).length;
        let failing = this.suites.filter((suite) => suite.failing()).length;
        const skipped = this.suites.filter((suite) => suite.skipped()).length;

        this.suites.filter((suite) => suite.failing()).forEach((suite) => this.archiver.extend('failures', suite.title()));
        this.suites.filter((suite) => suite.passing()).forEach((suite) => this.archiver.extend('passes', suite.title()));

        this.archiver.set('passed scenarios', passing);
        this.archiver.set('skipped scenarios', skipped);
        this.archiver.set('failed scenarios', failing);

        console.log(chalk.hex('#8839EF')(`${this.indent()}Test Suite Results`));
        console.log(chalk.hex('#8839EF')(`${this.indent()}==================`));
        console.log();
        console.log(chalk.hex('#8839EF')(`${this.indent()}Scenarios:`));

        this.indentationLevel += 1;
        console.log(chalk.hex('#40a02b')(`${this.indent()}${passing} passing` + chalk.black(` (${time.toFixed(0)}ms)`)));
        console.log(chalk.hex('#e64553')(`${this.indent()}${failing} failing`));
        console.log(chalk.black(`${this.indent()}${skipped} skipped`));
        console.log();
        this.indentationLevel -= 1;

        console.log(chalk.hex('#8839EF')(`${this.indent()}Actions:`));

        passing = this.suites.flatMap((suite) =>
            suite.results.filter((result) =>
                result.completion === Completion.succeeded).length).reduce((acc, val) => acc + val, 0);
        failing = this.suites.flatMap((suite) =>
            suite.results.filter((result) =>
                result.completion === Completion.failed).length).reduce((acc, val) => acc + val, 0);
        const timedout = this.suites.flatMap((suite) =>
            suite.results.filter((result) =>
                result.completion === Completion.timedout).length).reduce((acc, val) => acc + val, 0);

        this.indentationLevel += 1;
        console.log(chalk.hex('#40a02b')(`${this.indent()}${passing} passing`));
        console.log(chalk.hex('#e64553')(`${this.indent()}${failing} failing`));
        console.log(chalk.black(`${this.indent()}${timedout} timeouts`));
        this.indentationLevel -= 1;

        console.log();

        this.archiver.write();
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
