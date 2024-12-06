import {Suite} from '../framework/Framework';
import {Step} from '../framework/scenario/Step';
import {getValue, Testee} from '../framework/Testee';
import {blue, bold, green, inverse, red, yellow} from 'ansi-colors';
import {Archiver} from '../framework/Archiver';
import {TestScenario} from '../framework/scenario/TestScenario';
import {version} from '../../package.json';
import {indent} from '../util/printing';
import {Result} from './Result';
import {Verbosity} from './index';
import {Style} from './Style';

export enum Completion {
    uncommenced = 'not started',  // test hasn't started
    succeeded = 'success',        // test succeeded
    failed = 'Failure: ',         // test failed
    timedout = 'timed out',       // test failed
    error = 'error: ',            // test was unable to complete
    skipped = 'skipped'           // test has failing dependencies
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

// const r Result = expect(e: Expected) <-- replaces the function in Testee todo

export class Reporter {
    private output: string = '';

    private indentationLevel: number = 2;

    private style: Style;

    private suites: SuiteResults[] = [];

    private archiver: Archiver;

    private verbosity: Verbosity = Verbosity.short;

    constructor(style: Style) {
        this.style = style;
        this.archiver = new Archiver(`${process.env.TESTFILE?.replace('.asserts.wast', '.wast') ?? 'suite'}.${Date.now()}.log`);
        this.archiver.set('date', new Date(Date.now()).toISOString());
    }

    private indent(override?: number) {
        return indent(override ?? this.indentationLevel, this.style.indentation);
    }

    general() {
        console.log(this.indent() + this.style.colors.highlight(this.style.bullet) + this.style.colors.highlight('latch') + this.style.emph(' General information'));
        // console.log(blue(`${this.indent()}===================`));
        console.log(this.indent() + ' '.repeat(2) + this.style.emph('version') + ' '.repeat(5) + version);
        console.log(this.indent() + ' '.repeat(2) + this.style.emph('archive') + ' '.repeat(5) + this.archiver.archive);
        console.log();
    }

    report(suiteResult: SuiteResults) {
        this.suites.push(suiteResult);
        const status = (suiteResult.error ? this.style.colors.error(this.style.labels.error) :
            (suiteResult.passing() ? this.style.colors.success(this.style.labels.suiteSuccess) : this.style.colors.failure(this.style.labels.failure)));
        console.log(this.indent() + this.style.colors.highlight(this.style.bullet) + this.style.colors.highlight('suite') + ` ${this.style.emph(suiteResult.title())}${(this.verbosity === Verbosity.minimal) ? ' ' + status : ''}`);
        if (this.verbosity > Verbosity.minimal) {
            console.log(this.indent() + ' '.repeat(2) + this.style.emph('testbed') + ' '.repeat(5) + suiteResult.testee.name);
            console.log(this.indent() + ' '.repeat(2) + this.style.emph('scenarios') + ' '.repeat(3) + suiteResult.scenarios.length);
            console.log(this.indent() + ' '.repeat(2) + this.style.emph('actions') + ' '.repeat(5) + suiteResult.suite.scenarios.flatMap((scenario) => scenario.steps ?? []).flat().length); //.reduce((total, count) => total + count));
            console.log(this.indent() + ' '.repeat(2) + this.style.emph('status') + ' '.repeat(6) + status);
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

        const passing = this.suites.flatMap((suite) => suite.scenarios).filter((scenario) => scenario.passing()).length;
        const failing = this.suites.flatMap((suite) => suite.scenarios).filter((scenario) => scenario.failing()).length;
        const skipped = this.suites.flatMap((suite) => suite.scenarios).filter((scenario) => scenario.skipped()).length;

        const scs = this.suites.flatMap((suite) => suite.scenarios);

        this.suites.flatMap((suite) => suite.scenarios).filter((scenario) => scenario.failing()).forEach((scenario) => this.archiver.extend('failures', scenario.title()));
        this.suites.flatMap((suite) => suite.scenarios).filter((scenario) => scenario.passing()).forEach((scenario) => this.archiver.extend('passes', scenario.title()));

        this.archiver.set('passed scenarios', passing);
        this.archiver.set('skipped scenarios', skipped);
        this.archiver.set('failed scenarios', failing);

        console.log(this.indent() + this.style.colors.highlight(this.style.bullet) + this.style.colors.highlight('results') + this.style.emph(' Overview'));
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
        console.log(this.indent() + this.style.emph('Test suites:') + ' '.repeat(len - pss[0].length) + this.style.emph((sc === tl ? green : red)(pss[0])) + `, ${tl} total` + this.style.emph(` (${time.toFixed(0)}ms)`));
        if (this.verbosity > Verbosity.minimal) {
            console.log(this.indent() + this.style.emph('Scenarios:') +
                ' '.repeat(2 + len - pss[1].length) + this.style.emph((passing === scs.length ? green : red)(pss[1])) +
                (skipped > 0 ? ', ' + this.style.emph(yellow(`${skipped} skipped`)) : '') + `, ${scs.length} total`);
            console.log(this.indent() + this.style.emph('Actions:') + ' '.repeat(4 + len - pss[2].length) + this.style.emph((passing === scs.length ? green : red)(pss[2])) + (timeouts > 0 ? `, ${timeouts} timeouts` : '') + `, ${total} total`);
        }
        this.indentationLevel -= 1;

        console.log();
        this.archiver.write();
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
