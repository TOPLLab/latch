import {SuiteResult} from './Results';
import {Archiver} from '../framework/Archiver';
import {Style} from './Style';
import {Verbosity} from './index';
import {version} from '../../package.json';
import {green, red, yellow} from 'ansi-colors';
import {Outcome, SilentDescriber} from './describers/Describer';
import {indent} from '../util/printing';
import {
    MinimalSuiteDescriber,
    NormalSuiteDescriber,
    ShortSuiteDescriber,
    SuiteDescriber
} from './describers/SuiteDescribers';

function describer(verbosity: Verbosity, item: SuiteResult): SuiteDescriber {
    switch (verbosity) {
    case Verbosity.none:
        return new SilentDescriber<SuiteResult>(item);
    case Verbosity.minimal:
        return new MinimalSuiteDescriber(item);
    case Verbosity.short:
        return new ShortSuiteDescriber(item);
    case Verbosity.normal:
    case Verbosity.more:
    case Verbosity.all:
    case Verbosity.debug:
    default:
        return new NormalSuiteDescriber(item);
    }
}

export class Reporter {
    private output: string = '';

    private indentationLevel: number = 2;

    private suites: SuiteResult[] = [];

    private archiver: Archiver;

    private readonly style: Style;

    private readonly verbosity: Verbosity;

    constructor(style: Style, verbosity: Verbosity = Verbosity.normal) {
        this.style = style;
        this.verbosity = verbosity;
        this.archiver = new Archiver(`${process.env.TESTFILE?.replace('.asserts.wast', '.wast') ?? 'suite'}.${Date.now()}.log`);
        this.archiver.set('date', new Date(Date.now()).toISOString());
    }

    private indent(override?: number) {
        return indent(override ?? this.indentationLevel, this.style.indentation);
    }

    general() {
        console.log(this.indent() + this.style.colors.highlight(this.style.bullet) + this.style.colors.highlight('latch.') + this.style.emph(' General information'));
        // console.log(blue(`${this.indent()}===================`));
        console.log(this.indent() + ' '.repeat(2) + this.style.emph('version') + ' '.repeat(5) + version);
        console.log(this.indent() + ' '.repeat(2) + this.style.emph('archive') + ' '.repeat(5) + this.archiver.archive);
        console.log();
    }

    report(suiteResult: SuiteResult) {
        this.suites.push(suiteResult);
        const report: string[] = describer(this.verbosity, suiteResult).describe(this.style);

        for (const line of report) {
            console.log(this.indent() + line);
        }
        console.log();
    }

    results(time: number) {
        this.archiver.set('duration (ms)', Math.round(time));

        const passing = this.suites.flatMap((suite) => suite.outcomes()).filter((scenario) => scenario.outcome === Outcome.succeeded).length;
        const failing = this.suites.flatMap((suite) => suite.outcomes()).filter((scenario) => scenario.outcome === Outcome.failed).length;
        const skipped = this.suites.flatMap((suite) => suite.outcomes()).filter((scenario) => scenario.outcome === Outcome.skipped).length;

        const scs = this.suites.flatMap((suite) => suite.outcomes());

        this.suites.flatMap((suite) => suite.outcomes()).filter((scenario) => scenario.outcome === Outcome.failed).forEach((scenario) => this.archiver.extend('failures', scenario.name));
        this.suites.flatMap((suite) => suite.outcomes()).filter((scenario) => scenario.outcome === Outcome.succeeded).forEach((scenario) => this.archiver.extend('passes', scenario.name));

        this.archiver.set('passed scenarios', passing);
        this.archiver.set('skipped scenarios', skipped);
        this.archiver.set('failed scenarios', failing);

        console.log(this.indent() + this.style.colors.highlight(this.style.bullet) + this.style.colors.highlight('results.') + this.style.emph(' Overview'));
        console.log();
        this.indentationLevel += 1;

        const sc = this.suites.filter((suite) => suite.outcome === Outcome.succeeded).length;
        const tl = this.suites.length;

        const psa = this.suites.flatMap((suite) => suite.outcomes()).flatMap((scenario) =>
            scenario.outcomes().filter((result) =>
                result.outcome === Outcome.succeeded).length).reduce((acc, val) => acc + val, 0);
        const timeouts = this.suites.flatMap((suite) => suite.outcomes()).flatMap((scenario) =>
            scenario.outcomes().filter((result) =>
                result.outcome === Outcome.timedout).length).reduce((acc, val) => acc + val, 0);
        const total = this.suites.flatMap((suite) => suite.outcomes()).flatMap((scenario) =>
            scenario.outcomes().length ?? 0).reduce((acc, val) => acc + val, 0);

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
}