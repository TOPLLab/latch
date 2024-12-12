import {Step} from '../framework/scenario/Step';
import {Outcome} from './describers/Describer';
import {TestScenario} from '../framework/scenario/TestScenario';
import {Suite} from '../framework/Framework';

export interface Result {
    outcome: Outcome;
    clarification: string;

    readonly name: string;
    readonly checks: number;

    readonly testbed?: string;

    update(outcome?: Outcome, clarification?: string): Result;

    error(clarification: string): Result;
}

interface AggregateResult extends Result {
    add(outcomes: Result): void;
    aggregate(outcomes: Result[]): void;
    outcomes(): Result[];
}

abstract class AbstractAggregateResult implements AggregateResult {
    abstract outcome: Outcome;
    abstract clarification: string;
    abstract readonly name: string;
    abstract readonly testbed?: string;
    abstract readonly checks: number;

    protected abstract subOutcomes: Result[];

    abstract update(outcome?: Outcome, clarification?: string): AggregateResult;

    error(clarification: string): AggregateResult {
        this.outcome = Outcome.error;
        this.clarification = clarification;
        return this;
    }

    add(outcome: Result) {
        this.subOutcomes.push(outcome);
        this.outcome = this.check();
    }

    aggregate(outcomes: Result[]) {
        this.subOutcomes = outcomes;
        this.outcome = this.check();
    }

    outcomes(): Result[] {
        return this.subOutcomes;
    }

    private check(): Outcome {
        if (this.outcome === Outcome.error) {
            return this.outcome;
        }

        if (this.passing()) {
            return Outcome.succeeded;
        } else if (this.failing()) {
            return Outcome.failed;
        }

        return Outcome.skipped;
    }

    private passing(): boolean {
        return this.subOutcomes.every((outcome) => outcome.outcome === Outcome.succeeded);
    }

    private failing(): boolean {
        return this.subOutcomes.some((outcome) => outcome.outcome === Outcome.failed);
    }
}

export class ScenarioResult extends AbstractAggregateResult {
    outcome: Outcome;
    clarification: string;
    readonly name: string;
    readonly testbed?: string;
    readonly checks: number;

    protected subOutcomes: StepOutcome[];

    constructor(scenario: TestScenario) {
        super();
        this.name = scenario.title;
        this.checks = scenario.steps?.map(step => step.expected?.length ?? 0).reduce((a, b) => a + b) ?? 0;
        this.testbed = scenario.steps?.[0].target;

        this.outcome = Outcome.uncommenced;
        this.clarification = '';

        this.subOutcomes = [];
    }

    update(outcome?: Outcome, clarification?: string): ScenarioResult {
        this.outcome = outcome ?? this.outcome;
        this.clarification = clarification ?? this.clarification;
        return this;
    }
}

export class SuiteResult extends AbstractAggregateResult {
    outcome: Outcome;
    clarification: string;
    readonly name: string;
    readonly testbed?: string;
    readonly checks: number;

    protected subOutcomes: ScenarioResult[];

    constructor(suite: Suite) {
        super();
        this.name = suite.title;
        this.checks = suite.scenarios.map(scenario => scenario.steps?.map(step => step.expected?.length ?? 0).reduce((a, b) => a + b) ?? 0).reduce((a, b) => a + b) ?? 0;
        this.testbed = suite.scenarios?.[0].steps?.[0].target;

        this.outcome = Outcome.uncommenced;
        this.clarification = '';

        this.subOutcomes = [];
    }

    update(outcome?: Outcome, clarification?: string): SuiteResult {
        this.outcome = outcome ?? this.outcome;
        this.clarification = clarification ?? this.clarification;
        return this;
    }

    outcomes(): ScenarioResult[] {
        return this.subOutcomes;
    }
}

export class StepOutcome implements Result {
    outcome: Outcome;
    clarification: string;
    readonly name: string;
    readonly testbed?: string;
    readonly checks: number;

    constructor(step: Step) {
        this.outcome = Outcome.uncommenced;
        this.name = step.title;
        this.clarification = '';
        this.testbed = step.target;
        this.checks = step.expected?.length ?? 0;
    }

    public update(outcome?: Outcome, clarification?: string): StepOutcome {
        this.outcome = outcome ?? this.outcome;
        this.clarification = clarification ?? this.clarification;
        return this;
    }

    public error(clarification: string): StepOutcome {
        this.outcome = Outcome.error;
        this.clarification = clarification;
        return this;
    }
}

export class Skipped implements Result {
    outcome: Outcome;
    clarification: string;
    readonly name: string;
    readonly testbed?: string;
    readonly checks: number;

    constructor(title: string, clarification: string) {
        this.outcome = Outcome.skipped;
        this.name = title;
        this.clarification = clarification;
        this.checks = 0;
    }

    public update(): Skipped {
        return this;
    }

    public error(clarification: string): Skipped {
        return this;
    }
}
