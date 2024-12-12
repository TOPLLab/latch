// decorator class for minimal describers
import {Outcome, Describer, StepDescriber} from './Describer';
import {ScenarioResult} from '../Results';
import {Style} from '../Style';

abstract class ScenarioDescriber extends Describer<ScenarioResult> {
    protected readonly label?: string;

    constructor(scenario: ScenarioResult, label?: string) {
        super(scenario);
        this.label = label;
    }
}

export class MinimalScenarioDescriber extends ScenarioDescriber {
    describe(style: Style): string[] {
        const report: string[] = [];
        report.push(style.colors.highlight(`scenario.`) + ' ' + style.emph(this.item.name) + ' ' + style.colors.highlight(this.label ?? '') + '\n');
        return report;
    }
}

export class ShortScenarioDescriber extends MinimalScenarioDescriber {
    describe(style: Style): string[] {
        let report: string[] = super.describe(style);
        if (this.item.outcome === Outcome.error) {
            report.push(style.colors.failureMessage(`${style.colors.failure(style.labels.error)}`));
            report = report.concat(this.item.clarification.trim().split('\n'));
        }
        return report;
    }
}

export class NormalScenarioDescriber extends ShortScenarioDescriber {
    describe(style: Style): string[] {
        let report: string[] = super.describe(style);
        if (this.item.outcome !== Outcome.error) {
            this.item.outcomes().forEach((outcome) => {
                report = report.concat(new StepDescriber(outcome).describe(style));
            });
        }
        return report;
    }
}
