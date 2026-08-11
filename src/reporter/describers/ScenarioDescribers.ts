// decorator class for minimal describers
import {Outcome, Describer, plainReporting, StepDescriber} from './Describer';
import {ScenarioResult} from '../Results';

abstract class ScenarioDescriber extends Describer<ScenarioResult> {
    protected readonly label?: string;

    constructor(scenario: ScenarioResult, label?: string) {
        super(scenario);
        this.label = label;
    }
}

export class MinimalScenarioDescriber extends ScenarioDescriber {
    describe(): string[] {
        const style = plainReporting();
        const report: string[] = [];
        report.push(style.colors.highlight(`scenario.`) + ' ' + style.emph(this.item.name) + ' ' + style.colors.highlight(this.label ?? '') + '\n');
        return report;
    }
}

export class ShortScenarioDescriber extends MinimalScenarioDescriber {
    describe(): string[] {
        const style = plainReporting();
        let report: string[] = super.describe();
        if (this.item.outcome === Outcome.error) {
            report.push(style.colors.failureMessage(`${style.colors.failure(style.labels.error)}`));
            report = report.concat(this.item.clarification.trim().split('\n'));
        }
        return report;
    }
}

export class NormalScenarioDescriber extends ShortScenarioDescriber {
    describe(): string[] {
        let report: string[] = super.describe();
        if (this.item.outcome !== Outcome.error) {
            this.item.outcomes().forEach((outcome) => {
                report = report.concat(new StepDescriber(outcome).describe());
            });
        }
        return report;
    }
}
