import {OutputStyle, Suite} from './Framework';
import {Behaviour, Description, Step} from './scenario/Step';
import {getValue, Testee} from './Testee';
import {blue, bold, green, red, yellow, reset, inverse, grey} from 'ansi-colors';
import {Archiver} from './Archiver';
import {TestScenario} from './scenario/TestScenario';
import {version} from '../../package.json';

export enum Completion {
    uncommenced = 'not started',  // test hasn't started
    succeeded = 'success',        // test succeeded
    failed = 'Failure: ',         // test failed
    timedout = 'timed out',       // test failed
    error = 'error: ',            // test was unable to complete
    skipped = 'skipped'           // test has failing dependencies
}

export enum Verbosity {
    none,
    minimal,
    short,
    normal,
    more,
    all,
    debug
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
    public error?: Error | string;

    constructor(suite: Suite, testee: Testee) {
        this.suite = suite;
        this.testee = testee;
    }

    title(): string {
        return this.suite.title;
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
        return `${this.test.title}`;
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

    report(index: number, level: number): void {
        // console.log(indent(level) + inverse(blue(` ${index + 1} `)) + ' ' + bold(this.title()) + '\n');
        console.log(indent(level) + bold(blue(`scenario.`)) + ' ' + bold(this.title()) + ' ' + bold(blue(`(${index + 1})`)) + '\n');
        if (this.error) {
            console.log(red(`${indent(level)}${bold(inverse(red(' ERROR ')))} ${this.error.message.trim().replace(/\n/g, `\n${indent(level)}`)}`));
        } else {
            this.results.forEach((result) => {
                result.report(level);
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

// const r Result = expect(e: Expected) <-- replaces the function in Testee todo

export class Reporter {
    private output: string = '';

    private indentationLevel: number = 2;

    private suites: SuiteResults[] = [];

    private archiver: Archiver;

    private verbosity: Verbosity = Verbosity.short;

    constructor() {
        this.archiver = new Archiver(`${process.env.TESTFILE?.replace('.asserts.wast', '.wast') ?? 'suite'}.${Date.now()}.log`);
        this.archiver.set('date', new Date(Date.now()).toISOString());
    }

    private indent(override?: number) {
        return indent(override ?? this.indentationLevel);
    }

    general() {
        console.log(this.indent() + blue(bold('● latch')) + bold(' General information'));
        // console.log(blue(`${this.indent()}===================`));
        console.log(this.indent() + ' '.repeat(2) + bold('version') + ' '.repeat(5) + version);
        console.log(this.indent() + ' '.repeat(2) + bold('archive') + ' '.repeat(5) + this.archiver.archive);
        console.log();
    }

    report(suiteResult: SuiteResults) {
        this.suites.push(suiteResult);
        const status = (suiteResult.error ? bold(inverse(red(' ERROR '))) :
            (suiteResult.passing() ? bold(inverse(green(' PASSED '))) : bold(inverse(red(' FAIL ')))));
        console.log(this.indent() + blue(bold('● suite')) + ` ${bold(suiteResult.title())}${(this.verbosity === Verbosity.minimal) ? ' ' + status : ''}`);
        if (this.verbosity > Verbosity.minimal) {
            console.log(this.indent() + ' '.repeat(2) + bold('testbed') + ' '.repeat(5) + suiteResult.testee.name);
            console.log(this.indent() + ' '.repeat(2) + bold('scenarios') + ' '.repeat(3) + suiteResult.scenarios.length);
            console.log(this.indent() + ' '.repeat(2) + bold('actions') + ' '.repeat(5) + suiteResult.suite.scenarios.flatMap((scenario) => scenario.steps ?? []).flat().length); //.reduce((total, count) => total + count));
            console.log(this.indent() + ' '.repeat(2) + bold('status') + ' '.repeat(6) + status);
        }
        console.log();
        if (this.verbosity >= Verbosity.normal) {
            suiteResult.scenarios.forEach((scenario, index) => {
                scenario.report(index, this.indentationLevel + 1);
            });
        } else if (this.verbosity > Verbosity.minimal) {
            if (suiteResult.error) {
                console.log(this.indent() + ' '.repeat(2) + red(suiteResult.error.toString()));
            }
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

        console.log(this.indent() + blue(bold('● results')) + bold(' Overview'));
        console.log();
        this.indentationLevel += 1;

        const sc = this.suites.filter((suite) => suite.passing()).length;
        const tl = this.suites.length;

        const psa = this.suites.flatMap((suite) => suite.scenarios).flatMap((scenario) =>
            scenario.results.filter((result) =>
                result.completion === Completion.succeeded).length).reduce((acc, val) => acc + val, 0);
        const fa = this.suites.flatMap((suite) => suite.scenarios).flatMap((scenario) =>
            scenario.results.filter((result) =>
                result.completion === Completion.failed).length).reduce((acc, val) => acc + val, 0);
        const timeouts = this.suites.flatMap((suite) => suite.scenarios).flatMap((scenario) =>
            scenario.results.filter((result) =>
                result.completion === Completion.timedout).length).reduce((acc, val) => acc + val, 0);
        const total = this.suites.flatMap((suite) => suite.scenarios).flatMap((scenario) =>
            scenario.test.steps?.length ?? 0).reduce((acc, val) => acc + val, 0);

        const len: number = 12;
        const pss = [`${sc} passing`, `${passing} passing`, `${psa} passing`]
        console.log(this.indent() + bold('Test suites:') + ' '.repeat(len - pss[0].length) + bold((sc === tl ? green : red)(pss[0])) + `, ${tl} total` + bold(` (${time.toFixed(0)}ms)`));
        if (this.verbosity > Verbosity.minimal) {
            console.log(this.indent() + bold('Scenarios:') +
                ' '.repeat(2 + len - pss[1].length) + bold((passing === scs.length ? green : red)(pss[1])) +
                (skipped > 0 ? ', ' + bold(yellow(`${skipped} skipped`)) : '') + `, ${scs.length} total`);
            console.log(this.indent() + bold('Actions:') + ' '.repeat(4 + len - pss[2].length) + bold((passing === scs.length ? green : red)(pss[2])) + (timeouts > 0 ? `, ${timeouts} timeouts` : '') + `, ${total} total`);
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
