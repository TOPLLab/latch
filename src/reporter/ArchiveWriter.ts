import {Archiver} from '../framework/Archiver';
import {SuiteResult} from './Results';
import {summarize} from './Summary';
import {Outcome} from './describers/Describer';

export class ArchiveWriter {
    private readonly archiver: Archiver;

    constructor(now: number = Date.now()) {
        this.archiver = new Archiver(`${process.env.TESTFILE?.replace('.asserts.wast', '.wast') ?? 'suite'}.${now}.log`);
        this.archiver.set('date', new Date(now).toISOString());
    }

    get archive(): string {
        return this.archiver.archive;
    }

    write(durationMs: number, suites: SuiteResult[]) {
        const summary = summarize(suites);
        const scenarios = suites.flatMap((suite) => suite.outcomes());

        this.archiver.set('duration (ms)', Math.round(durationMs));

        scenarios
            .filter((scenario) => scenario.outcome === Outcome.failed)
            .forEach((scenario) => this.archiver.extend('failures', scenario.name));

        scenarios
            .filter((scenario) => scenario.outcome === Outcome.succeeded)
            .forEach((scenario) => this.archiver.extend('passes', scenario.name));

        this.archiver.set('passed scenarios', summary.scenarios.passing);
        this.archiver.set('skipped scenarios', summary.scenarios.skipped);
        this.archiver.set('failed scenarios', summary.scenarios.failing);

        this.archiver.write();
    }
}
