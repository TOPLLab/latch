import {SuiteResult} from './Results';
import {Outcome} from './describers/Describer';
import {ReporterSnapshot} from './ReporterState';

export interface SummaryTotals {
    suites: {
        passing: number;
        failing: number;
        skipped: number;
        total: number;
    };
    scenarios: {
        passing: number;
        failing: number;
        skipped: number;
        errors: number;
        total: number;
    };
    actions: {
        passing: number;
        failing: number;
        skipped: number;
        timeouts: number;
        errors: number;
        total: number;
    };
}

export function summarize(suites: SuiteResult[]): SummaryTotals {
    const scenarios = suites.flatMap((suite) => suite.outcomes());
    return summarizeItems(suites, scenarios);
}

export function summarizeSnapshot(snapshot: ReporterSnapshot): SummaryTotals {
    const completedSuites = snapshot.completedRuns.map((run) => run.suite);
    const activeSuites = snapshot.activeRuns.map((run) => run.suite);
    const activeScenarios = snapshot.activeRuns.flatMap((run) => run.scenarios);

    return summarizeItems([...completedSuites, ...activeSuites], [
        ...completedSuites.flatMap((suite) => suite.outcomes()),
        ...activeScenarios
    ]);
}

function summarizeItems(suites: SuiteResult[], scenarios: ReturnType<SuiteResult['outcomes']>): SummaryTotals {
    const actions = scenarios.flatMap((scenario) => scenario.outcomes());

    return {
        suites: {
            passing: suites.filter((suite) => suite.outcome === Outcome.succeeded).length,
            failing: suites.filter((suite) => suite.outcome === Outcome.failed || suite.outcome === Outcome.error).length,
            skipped: suites.filter((suite) => suite.outcome === Outcome.skipped).length,
            total: suites.length
        },
        scenarios: {
            passing: scenarios.filter((scenario) => scenario.outcome === Outcome.succeeded).length,
            failing: scenarios.filter((scenario) => scenario.outcome === Outcome.failed).length,
            skipped: scenarios.filter((scenario) => scenario.outcome === Outcome.skipped).length,
            errors: scenarios.filter((scenario) => scenario.outcome === Outcome.error).length,
            total: scenarios.length
        },
        actions: {
            passing: actions.filter((action) => action.outcome === Outcome.succeeded).length,
            failing: actions.filter((action) => action.outcome === Outcome.failed).length,
            skipped: actions.filter((action) => action.outcome === Outcome.skipped).length,
            timeouts: actions.filter((action) => action.outcome === Outcome.timedout).length,
            errors: actions.filter((action) => action.outcome === Outcome.error).length,
            total: actions.length
        }
    };
}
