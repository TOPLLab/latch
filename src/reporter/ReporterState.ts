import {ScenarioResult, StepOutcome, SuiteResult} from './Results';
import {SuiteRun} from './Reporter';

export type ReporterLogLevel = 'info' | 'error' | 'debug';

export interface ReporterLog {
    level: ReporterLogLevel;
    text: string;
    timestamp: number;
}

export interface ReporterRunState extends SuiteRun {
    scenarios: ScenarioResult[];
    activeScenario?: ScenarioResult;
    lastStep?: StepOutcome;
    finishedAt?: number;
}

export interface ReporterSnapshot {
    activeRuns: ReporterRunState[];
    completedRuns: ReporterRunState[];
    logs: ReporterLog[];
    durationMs?: number;
    started: boolean;
    finished: boolean;
}

export class ReporterState {
    private readonly active = new Map<string, ReporterRunState>();
    private readonly completed: ReporterRunState[] = [];
    private readonly logEntries: ReporterLog[] = [];
    private duration?: number;
    private hasStarted = false;
    private hasFinished = false;

    start() {
        this.hasStarted = true;
    }

    suiteStarted(run: SuiteRun) {
        this.active.set(run.id, {
            ...run,
            scenarios: []
        });
    }

    scenarioStarted(runId: string, scenario: ScenarioResult) {
        const run = this.active.get(runId);
        if (!run) {
            return;
        }

        if (!run.scenarios.includes(scenario)) {
            run.scenarios.push(scenario);
        }
        run.activeScenario = scenario;
    }

    stepFinished(runId: string, scenario: ScenarioResult, step: StepOutcome) {
        const run = this.active.get(runId);
        if (!run) {
            return;
        }

        if (!run.scenarios.includes(scenario)) {
            run.scenarios.push(scenario);
        }
        run.activeScenario = scenario;
        run.lastStep = step;
    }

    scenarioFinished(runId: string, scenario: ScenarioResult) {
        const run = this.active.get(runId);
        if (!run) {
            return;
        }

        if (!run.scenarios.includes(scenario)) {
            run.scenarios.push(scenario);
        }

        if (run.activeScenario === scenario) {
            run.activeScenario = undefined;
        }
    }

    suiteFinished(runId: string, suite: SuiteResult) {
        const run = this.active.get(runId);
        if (!run) {
            return;
        }

        run.suite = suite;
        run.finishedAt = Date.now();
        run.activeScenario = undefined;
        this.active.delete(runId);
        this.completed.push(run);
    }

    log(level: ReporterLogLevel, text: string) {
        this.logEntries.push({level, text, timestamp: Date.now()});
    }

    finish(durationMs: number) {
        this.duration = durationMs;
        this.hasFinished = true;
    }

    suites(): SuiteResult[] {
        return this.snapshot().completedRuns.map((run) => run.suite);
    }

    snapshot(): ReporterSnapshot {
        return {
            activeRuns: Array.from(this.active.values()),
            completedRuns: [...this.completed],
            logs: [...this.logEntries],
            durationMs: this.duration,
            started: this.hasStarted,
            finished: this.hasFinished
        };
    }
}
