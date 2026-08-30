import React from 'react';
import {Instance, render} from 'ink';
import {ArchivedTestbed, ArchiveWriter} from '../ArchiveWriter';
import {Reporter, SuiteRun} from '../Reporter';
import {ReporterState} from '../ReporterState';
import {ScenarioResult, StepOutcome, SuiteResult} from '../Results';
import {Verbosity} from '../index';
import {App} from './App';
import {Meta} from '../../testbeds/Testbed';

export class InkReporter implements Reporter {
    private readonly state = new ReporterState();
    private readonly archiveWriter: ArchiveWriter;
    private instance?: Instance;
    private verbosityLevel: Verbosity;
    private readonly testbedMetadata = new Map<string, Promise<string>>();
    private metadataRevision = 0;

    constructor(verbosity: Verbosity = Verbosity.normal, archiveWriter: ArchiveWriter = new ArchiveWriter()) {
        this.verbosityLevel = verbosity;
        this.archiveWriter = archiveWriter;
    }

    verbosity(level: Verbosity) {
        this.verbosityLevel = level;
        this.rerender();
    }

    start() {
        this.testbedMetadata.clear();
        this.metadataRevision = 0;
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

    metadata(runId: string, metadata: Promise<string>) {
        this.testbedMetadata.set(runId, metadata);
        this.metadataRevision++;
        this.rerender();
    }

    async finish(durationMs: number) {
        this.state.finish(durationMs);
        this.archiveWriter.write(durationMs, this.state.suites(), await this.archiveMetadata());
        this.rerender();
    }

    async close(): Promise<void> {
        if (!this.instance) {
            return;
        }

        this.rerender();
        await this.flushInk();
        const closed = this.instance.waitUntilExit();
        this.instance.unmount();
        await closed;
        await this.flushInk();
    }

    private rerender() {
        this.instance?.rerender(this.element());
    }

    private element() {
        return React.createElement(App, {
            snapshot: this.state.snapshot(),
            archive: this.archiveWriter.archive,
            verbosity: this.verbosityLevel,
            metadata: Array.from(this.testbedMetadata.values()),
            metadataRevision: this.metadataRevision
        });
    }

    private async archiveMetadata(): Promise<ArchivedTestbed[]> {
        const metadata = await Promise.all(Array.from(this.testbedMetadata.values()).map(async entry => {
            try {
                const parsed = JSON.parse(await entry) as Record<string, unknown>;
                const name = parsed[Meta.Name];
                const architecture = parsed[Meta.Architecture];
                const version = parsed[Meta.Version];

                return typeof name === 'string' && typeof architecture === 'string' && typeof version === 'string'
                    ? {name, architecture, version}
                    : undefined;
            } catch {
                return undefined;
            }
        }));

        const testbeds = new Map<string, ArchivedTestbed>();
        for (const metadataEntry of metadata) {
            if (metadataEntry === undefined) {
                continue;
            }

            const key = JSON.stringify(metadataEntry);
            const testbed = testbeds.get(key);
            if (testbed !== undefined) {
                testbed.suites++;
            } else {
                testbeds.set(key, {...metadataEntry, suites: 1});
            }
        }

        return Array.from(testbeds.values());
    }

    private async flushInk(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}
