import {OutputStyle, Suite} from './Framework';
import {Behaviour, Description, Step} from './scenario/Step';
import {getValue, Testee} from './Testee';
import {blue, bold, green, red, reset} from 'ansi-colors';
import {Archiver} from './Archiver';
import {TestScenario} from './scenario/TestScenario';

export enum Completion {
    uncommenced = 'not started',  // test hasn't started
    succeeded = 'success',        // test succeeded
    failed = 'Failure: ',         // test failed
    timedout = 'timed out',       // test failed
    error = 'error: ',            // test was unable to complete
    skipped = 'skipped'           // test has failing dependencies
}

function indent(level: number, size: number = 2): string {
    return ' '.repeat(level * size);
}

export function expect(step: Step, actual: Object | void, previous?: Object): Result {
    const result: Result = new Result(step.title, '');
    result.completion = Completion.succeeded;
    for (const expectation of step.expected ?? []) {
        for (const [field, entry] of Object.entries(expectation)) {
            try {
                const value = getValue(actual, field);

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
            } catch (e) {
                result.error(`Failure: ${JSON.stringify(actual)} state does not contain '${field}'.`);
                return result;
            }
        }
    }
    return result;
}

export class SuiteResults {
    public suite: Suite;
    public testee: Testee;
    public scenarios: ScenarioResult[] = [];
    public error?: Error;

    constructor(suite: Suite, testee: Testee) {
        this.suite = suite;
        this.testee = testee;
    }

    title(): string {
        return `${this.testee.name}: ${this.suite.title}`;
    }

    passing(): boolean {
        return this.scenarios.every((scenario) => scenario.passing());
    }

    failing(): boolean {
        return this.error !== undefined || this.scenarios.some((scenario) => scenario.failing());
    }

    skipped(): boolean {
        return this.scenarios.every((scenario) => scenario.skipped());
    }
}

export class ScenarioResult {
    public test: TestScenario;
    public testee: Testee;
    public results: Result[] = [];
    public error?: Error;


    constructor(test: TestScenario, testee: Testee) {
        this.test = test;
        this.testee = testee;
    }

    title(): string {
        return `${this.testee.name}: ${this.test.title}`;
    }

    steps(): string[] {
        return this.results.map((result) => result.toString());
    }

    passing(): boolean {
        return this.error === undefined && this.results.every((result) => result.completion === Completion.succeeded);
    }

    failing(): boolean {
        return this.error !== undefined || this.results.some((result) => result.completion === Completion.failed);
    }

    skipped(): boolean {
        return this.results.every((result) => result.completion === Completion.uncommenced);
    }

    report(level: number): void {
        console.log(blue(`${indent(level)}${this.title()}`));
        if (this.error) {
            console.log(red(`${indent(level + 1)}✖ Error: ${this.error.message}`));
        } else {
            this.results.forEach((result) => {
                result.report(level + 1);
            });
        }
        console.log()
    }
}

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
                return `${green('✔')} ${this.name}`;
            case Completion.uncommenced:
                return `${this.name}: skipped`;
            case Completion.error:
            case Completion.failed:
            default:
                return `${red('✖')} ${this.name}\n        ${red(this.completion)}${red(this.description)}`;

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

// const r Result = expect(e: Expected) <-- replaces the function in Testee todo

export class Reporter {
    private output: string = '';

    private indentationLevel: number = 2;

    private suites: SuiteResults[] = [];

    private archiver: Archiver;

    constructor() {
        this.archiver = new Archiver(`${process.env.TESTFILE?.replace('.asserts.wast', '.wast') ?? 'suite'}.${Date.now()}.log`);
        this.archiver.set('date', new Date(Date.now()).toISOString());
    }

    private indent(override?: number) {
        return indent(override ?? this.indentationLevel);
    }

    general() {
        console.log(blue(`${this.indent()}General Information`));
        console.log(blue(`${this.indent()}===================`));
        console.log(blue(`${this.indent()}VM commit   ${'47a672e'}`));
        console.log();
    }

    report(suiteResult: SuiteResults) {
        this.suites.push(suiteResult);
        console.log(blue(`${this.indent()}${suiteResult.title()}`));
        console.log();
        if (suiteResult.error) {
            console.log(red(`${this.indent(this.indentationLevel + 1)}✖ Error: ${suiteResult.error.message ?? suiteResult.error}`));
        } else {
            suiteResult.scenarios.forEach((scenario) => {
                scenario.report(this.indentationLevel);
            });
        }
        console.log();
    }

    results(time: number) {
        this.archiver.set('duration (ms)', Math.round(time));

        let passing = this.suites.flatMap((suite) => suite.scenarios).filter((scenario) => scenario.passing()).length;
        let failing = this.suites.flatMap((suite) => suite.scenarios).filter((scenario) => scenario.failing()).length;
        const skipped = this.suites.flatMap((suite) => suite.scenarios).filter((scenario) => scenario.skipped()).length;

        const scs = this.suites.flatMap((suite) => suite.scenarios);

        this.suites.flatMap((suite) => suite.scenarios).filter((scenario) => scenario.failing()).forEach((scenario) => this.archiver.extend('failures', scenario.title()));
        this.suites.flatMap((suite) => suite.scenarios).filter((scenario) => scenario.passing()).forEach((scenario) => this.archiver.extend('passes', scenario.title()));

        this.archiver.set('passed scenarios', passing);
        this.archiver.set('skipped scenarios', skipped);
        this.archiver.set('failed scenarios', failing);

        console.log(blue(`${this.indent()}Test Suite Results`));
        console.log(blue(`${this.indent()}==================`));
        console.log();
        console.log(blue(`${this.indent()}Scenarios:`));

        this.indentationLevel += 1;
        console.log(green(`${this.indent()}${passing} passing` + reset(` (${time.toFixed(0)}ms)`)));
        if (failing > 0) {
            console.log(red(`${this.indent()}${failing} failing`));
        }
        console.log(reset(`${this.indent()}${skipped} skipped`));
        console.log();
        this.indentationLevel -= 1;

        console.log(blue(`${this.indent()}Actions:`));

        passing = this.suites.flatMap((suite) => suite.scenarios).flatMap((scenario) =>
            scenario.results.filter((result) =>
                result.completion === Completion.succeeded).length).reduce((acc, val) => acc + val, 0);
        failing = this.suites.flatMap((suite) => suite.scenarios).flatMap((scenario) =>
            scenario.results.filter((result) =>
                result.completion === Completion.failed).length).reduce((acc, val) => acc + val, 0);
        const timeouts = this.suites.flatMap((suite) => suite.scenarios).flatMap((scenario) =>
            scenario.results.filter((result) =>
                result.completion === Completion.timedout).length).reduce((acc, val) => acc + val, 0);

        this.indentationLevel += 1;
        console.log(green(`${this.indent()}${passing} passing`));
        if (failing > 0) {
            console.log(red(`${this.indent()}${failing} failing`));
        }
        if (timeouts > 0) {
            console.log(reset(`${this.indent()}${timeouts} timeouts`));
        }
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

function deepEqual(a: any, b: any): boolean {
    return a === b || (isNaN(a) && isNaN(b));
}