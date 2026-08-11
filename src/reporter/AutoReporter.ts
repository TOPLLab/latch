import {Reporter, SuiteRun} from './Reporter';
import {ReporterFactory, ReporterSelection} from './ReporterFactory';
import {ScenarioResult, StepOutcome, SuiteResult} from './Results';
import {StyleType, Verbosity} from './index';

export class AutoReporter implements Reporter {
    private selected?: Reporter;
    private styleType: StyleType;
    private verbosityLevel: Verbosity;

    constructor(style: StyleType = StyleType.plain, verbosity: Verbosity = Verbosity.normal, private readonly selection: ReporterSelection = ReporterSelection.auto) {
        this.styleType = style;
        this.verbosityLevel = verbosity;
    }

    style(type: StyleType) {
        this.styleType = type;
        this.selected?.style(type);
    }

    styling(): StyleType {
        return this.selected?.styling() ?? this.styleType;
    }

    verbosity(level: Verbosity) {
        this.verbosityLevel = level;
        this.selected?.verbosity(level);
    }

    start() {
        if (!this.selected) {
            this.selected = ReporterFactory.create(this.styleType, this.verbosityLevel, this.selection);
        }
        this.selected.start();
    }

    suiteStarted(run: SuiteRun) {
        this.delegate().suiteStarted(run);
    }

    scenarioStarted(runId: string, scenario: ScenarioResult) {
        this.delegate().scenarioStarted(runId, scenario);
    }

    stepFinished(runId: string, scenario: ScenarioResult, step: StepOutcome) {
        this.delegate().stepFinished(runId, scenario, step);
    }

    scenarioFinished(runId: string, scenario: ScenarioResult) {
        this.delegate().scenarioFinished(runId, scenario);
    }

    suiteFinished(runId: string, suite: SuiteResult) {
        this.delegate().suiteFinished(runId, suite);
    }

    info(text: string) {
        this.delegate().info(text);
    }

    error(text: string) {
        this.delegate().error(text);
    }

    debug(text: string) {
        this.delegate().debug(text);
    }

    finish(durationMs: number) {
        this.delegate().finish(durationMs);
    }

    close(): Promise<void> {
        return this.delegate().close();
    }

    private delegate(): Reporter {
        if (!this.selected) {
            this.selected = ReporterFactory.create(this.styleType, this.verbosityLevel, this.selection);
        }

        return this.selected;
    }
}
