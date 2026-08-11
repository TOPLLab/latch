import {green, red, yellow} from 'ansi-colors';
import {version} from '../../package.json';
import {indent} from '../util/printing';
import {ArchiveWriter} from './ArchiveWriter';
import {Reporter, SuiteRun} from './Reporter';
import {ScenarioResult, StepOutcome, SuiteResult} from './Results';
import {Style, styling as styleMap} from './Style';
import {summarize} from './Summary';
import {Outcome, SilentDescriber} from './describers/Describer';
import {
    MinimalSuiteDescriber,
    NormalSuiteDescriber,
    ShortSuiteDescriber,
    SuiteDescriber
} from './describers/SuiteDescribers';
import {StyleType, Verbosity} from './index';

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

export class PlainReporter implements Reporter {
    private output: string = '';
    private indentationLevel: number = 2;
    private readonly suites: SuiteResult[] = [];
    private readonly archiveWriter: ArchiveWriter;
    private design: Style;
    private verboseness: Verbosity;

    constructor(style: StyleType = StyleType.plain, verbosity: Verbosity = Verbosity.normal, archiveWriter: ArchiveWriter = new ArchiveWriter()) {
        this.design = styleMap(style);
        this.verboseness = verbosity;
        this.archiveWriter = archiveWriter;
    }

    private indent(override?: number) {
        return indent(override ?? this.indentationLevel, this.design.indentation);
    }

    style(type: StyleType) {
        this.design = styleMap(type);
    }

    styling(): StyleType {
        return this.design.type;
    }

    verbosity(level: Verbosity) {
        this.verboseness = level;
    }

    start() {
        console.log(this.indent() + this.design.colors.highlight(this.design.bullet) + this.design.colors.highlight('latch.') + this.design.emph(' General information'));
        console.log(this.indent() + ' '.repeat(2) + this.design.emph('version') + ' '.repeat(5) + version);
        console.log(this.indent() + ' '.repeat(2) + this.design.emph('archive') + ' '.repeat(5) + this.archiveWriter.archive);
        console.log(this.design.end);
    }

    suiteStarted(_run: SuiteRun) {
        // Plain output remains suite-buffered for readable CI/non-TTY logs.
    }

    scenarioStarted(_runId: string, _scenario: ScenarioResult) {
        // Plain output remains suite-buffered for readable CI/non-TTY logs.
    }

    stepFinished(_runId: string, _scenario: ScenarioResult, _step: StepOutcome) {
        // Plain output remains suite-buffered for readable CI/non-TTY logs.
    }

    scenarioFinished(_runId: string, _scenario: ScenarioResult) {
        // Plain output remains suite-buffered for readable CI/non-TTY logs.
    }

    suiteFinished(_runId: string, suiteResult: SuiteResult) {
        this.suites.push(suiteResult);
        const report: string[] = describer(this.verboseness, suiteResult).describe(this.design);

        for (const line of report) {
            console.log(this.indent() + line);
        }
        console.log(this.design.end);
    }

    finish(durationMs: number) {
        this.archiveWriter.write(durationMs, this.suites);
        const summary = summarize(this.suites);

        console.log(this.indent() + this.design.colors.highlight(this.design.bullet) + this.design.colors.highlight('results.') + this.design.emph(' Overview'));
        console.log();
        this.indentationLevel += 1;

        const len: number = 12;
        const suitePassing = `${summary.suites.passing} passing`;
        const scenarioPassing = `${summary.scenarios.passing} passing`;
        const actionPassing = `${summary.actions.passing} passing`;

        console.log(this.indent() + this.design.emph('Test suites:') + ' '.repeat(len - suitePassing.length) + this.design.emph((summary.suites.passing === summary.suites.total ? green : red)(suitePassing)) + `, ${summary.suites.total} total` + this.design.emph(` (${durationMs.toFixed(0)}ms)`));
        if (this.verboseness > Verbosity.minimal) {
            console.log(this.indent() + this.design.emph('Scenarios:') +
                ' '.repeat(2 + len - scenarioPassing.length) + this.design.emph((summary.scenarios.passing === summary.scenarios.total ? green : red)(scenarioPassing)) +
                (summary.scenarios.skipped > 0 ? ', ' + this.design.emph(yellow(`${summary.scenarios.skipped} skipped`)) : '') + `, ${summary.scenarios.total} total`);
            console.log(this.indent() + this.design.emph('Actions:') + ' '.repeat(4 + len - actionPassing.length) + this.design.emph((summary.actions.passing === summary.actions.total ? green : red)(actionPassing)) + (summary.actions.timeouts > 0 ? `, ${summary.actions.timeouts} timeouts` : '') + `, ${summary.actions.total} total`);
        }
        this.indentationLevel -= 1;

        console.log(this.design.end);
    }

    info(text: string) {
        this.output += `info: ${text}\n`;
    }

    error(text: string) {
        this.output += `error: ${text}\n`;
    }

    debug(text: string) {
        if (this.verboseness === Verbosity.debug) {
            console.debug(text);
        }
    }

    async close(): Promise<void> {
        return Promise.resolve();
    }
}
