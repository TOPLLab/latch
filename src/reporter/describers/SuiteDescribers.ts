import {Outcome, Describer} from './Describer';
import {SuiteResult} from '../Results';
import {Style} from '../Style';
import {red} from 'ansi-colors';
import {NormalScenarioDescriber} from './ScenarioDescribers';

const table: (style: Style) => Map<Outcome, string> =
    (style: Style) => new Map([
        [Outcome.error, style.colors.error(style.labels.error)],
        [Outcome.succeeded, style.colors.success(style.labels.suiteSuccess)],
        [Outcome.failed, style.colors.failure(style.labels.failure)],
        [Outcome.skipped, style.colors.skipped(style.labels.suiteSkipped)]]);

export abstract class SuiteDescriber extends Describer<SuiteResult> {}

export class MinimalSuiteDescriber extends SuiteDescriber {
    describe(style: Style): string[] {
        const report: string[] = [];
        const status = (this.item.outcome === Outcome.error ? style.colors.error(style.labels.error) :
            (this.item.outcome === Outcome.succeeded ? style.colors.success(style.labels.suiteSuccess) : style.colors.failure(style.labels.failure)));
        report.push(style.colors.highlight(style.bullet) + style.colors.highlight('suite.') + ` ${style.emph(this.item.name)} ${status}`);
        return report;
    }
}

export class ShortSuiteDescriber extends SuiteDescriber {
    describe(style: Style): string[] {
        let report: string[] = [];
        report = report.concat(this.overview(style));

        if (this.item.outcome === Outcome.error) {
            report.push('');
            report.push(' '.repeat(2) + red(this.item.clarification.toString()));
        }
        return report;
    }

    protected overview(style: Style): string[] {
        const overview: string[] = [];
        const status = table(style).get(this.item.outcome) ?? style.colors.skipped(style.labels.suiteSkipped);
        overview.push(style.colors.highlight(style.bullet) + style.colors.highlight('suite.') + ` ${style.emph(this.item.name)}`);
        if (this.item.testbed) {
            overview.push(' '.repeat(2) + style.emph('testbed') + ' '.repeat(5) + this.item.testbed);
        }
        overview.push(' '.repeat(2) + style.emph('scenarios') + ' '.repeat(3) + this.item.outcomes().length);
        overview.push(' '.repeat(2) + style.emph('actions') + ' '.repeat(5) + this.item.outcomes().flatMap((scenario) => scenario.outcomes() ?? []).flat().length); //.reduce((total, count) => total + count));
        overview.push(' '.repeat(2) + style.emph('status') + ' '.repeat(6) + status);
        return overview;
    }
}

export class NormalSuiteDescriber extends ShortSuiteDescriber {
    describe(style: Style): string[] {

        let report: string[] = [];
        report = report.concat(this.overview(style));
        report.push('');

        this.item.outcomes().forEach((scenario, index) => {
            report = report.concat(new NormalScenarioDescriber(scenario, `(#${index + 1})`).describe(style));
            report.push('');
        });

        if (this.item.outcome === Outcome.error) {
            report.push(' '.repeat(2) + red(this.item.clarification.toString()));
        }

        return report;
    }

}
