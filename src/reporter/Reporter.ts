import {ScenarioResult, StepOutcome, SuiteResult} from './Results';
import {StyleType, Verbosity} from './index';

export interface SuiteRun {
    id: string;
    suite: SuiteResult;
    suiteTitle: string;
    testeeName: string;
    executionIndex: number;
    startedAt: number;
    plannedScenarios?: number;
    plannedActions?: number;
}

export interface Reporter {
    start(): void;

    suiteStarted(run: SuiteRun): void;

    scenarioStarted(runId: string, scenario: ScenarioResult): void;

    stepFinished(runId: string, scenario: ScenarioResult, step: StepOutcome): void;

    scenarioFinished(runId: string, scenario: ScenarioResult): void;

    suiteFinished(runId: string, suite: SuiteResult): void;

    info(text: string): void;

    error(text: string): void;

    debug(text: string): void;

    finish(durationMs: number): void;

    close(): Promise<void>;

    style(type: StyleType): void;

    styling(): StyleType;

    verbosity(level: Verbosity): void;
}
