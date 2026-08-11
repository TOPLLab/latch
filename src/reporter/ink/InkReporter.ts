import React from 'react';
import {Instance, render} from 'ink';
import {ArchiveWriter} from '../ArchiveWriter';
import {Reporter, SuiteRun} from '../Reporter';
import {ReporterState} from '../ReporterState';
import {ScenarioResult, StepOutcome, SuiteResult} from '../Results';
import {StyleType, Verbosity} from '../index';
import {App} from './App';

export class InkReporter implements Reporter {
    private readonly state = new ReporterState();
    private readonly archiveWriter: ArchiveWriter;
    private instance?: Instance;
    private styleType: StyleType;
    private verbosityLevel: Verbosity;

    constructor(style: StyleType = StyleType.plain, verbosity: Verbosity = Verbosity.normal, archiveWriter: ArchiveWriter = new ArchiveWriter()) {
        this.styleType = style;
        this.verbosityLevel = verbosity;
        this.archiveWriter = archiveWriter;
    }

    style(type: StyleType) {
        this.styleType = type;
        this.rerender();
    }

    styling(): StyleType {
        return this.styleType;
    }

    verbosity(level: Verbosity) {
        this.verbosityLevel = level;
        this.rerender();
    }

    start() {
        this.state.start();
        this.instance = render(this.element(), {patchConsole: true});
    }

    suiteStarted(run: SuiteRun) {
        this.state.suiteStarted(run);
        this.rerender();
    }

    scenarioStarted(runId: string, scenario: ScenarioResult) {
        this.state.scenarioStarted(runId, scenario);
        this.rerender();
    }

    stepFinished(runId: string, scenario: ScenarioResult, step: StepOutcome) {
        this.state.stepFinished(runId, scenario, step);
        this.rerender();
    }

    scenarioFinished(runId: string, scenario: ScenarioResult) {
        this.state.scenarioFinished(runId, scenario);
        this.rerender();
    }

    suiteFinished(runId: string, suite: SuiteResult) {
        this.state.suiteFinished(runId, suite);
        this.rerender();
    }

    info(text: string) {
        this.state.log('info', text);
        this.rerender();
    }

    error(text: string) {
        this.state.log('error', text);
        this.rerender();
    }

    debug(text: string) {
        if (this.verbosityLevel === Verbosity.debug) {
            this.state.log('debug', text);
            this.rerender();
        }
    }

    finish(durationMs: number) {
        this.state.finish(durationMs);
        this.archiveWriter.write(durationMs, this.state.suites());
        this.rerender();
    }

    async close(): Promise<void> {
        if (!this.instance) {
            return;
        }

        this.rerender();
        await this.flushInk();
        this.instance.unmount();
        await this.instance.waitUntilExit();
        await this.flushInk();
    }

    private rerender() {
        this.instance?.rerender(this.element());
    }

    private element() {
        return React.createElement(App, {
            snapshot: this.state.snapshot(),
            archive: this.archiveWriter.archive,
            verbosity: this.verbosityLevel
        });
    }

    private async flushInk(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}
