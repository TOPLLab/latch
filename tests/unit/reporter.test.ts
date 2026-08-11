import test from 'ava';
import React from 'react';
import {mkdtempSync, readFileSync, rmSync} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';
import {render} from 'ink-testing-library';
import {Framework, Suite} from '../../src/framework/Framework';
import {TestScenario} from '../../src/framework/scenario/TestScenario';
import {Kind, Step} from '../../src/framework/scenario/Step';
import {ArchiveWriter} from '../../src/reporter/ArchiveWriter';
import {AutoReporter} from '../../src/reporter/AutoReporter';
import {InkReporter} from '../../src/reporter/ink/InkReporter';
import {App} from '../../src/reporter/ink/App';
import {PlainReporter} from '../../src/reporter/PlainReporter';
import {Reporter, SuiteRun} from '../../src/reporter/Reporter';
import {ReporterFactory, ReporterSelection} from '../../src/reporter/ReporterFactory';
import {ReporterState} from '../../src/reporter/ReporterState';
import {ScenarioResult, StepOutcome, SuiteResult} from '../../src/reporter/Results';
import {summarize} from '../../src/reporter/Summary';
import {Outcome} from '../../src/reporter/describers/Describer';
import {StyleType, Verbosity} from '../../src/reporter';

const step = (title: string): Step => ({
    title,
    instruction: {
        kind: Kind.Action,
        value: {
            act: async () => ({value: 1})
        }
    },
    expected: []
});

const scenario = (title: string, steps: Step[] = [step('step')]): TestScenario => ({
    title,
    program: 'program.wast',
    steps
});

const suiteResult = (title = 'suite', scenarios: TestScenario[] = [scenario('scenario')]): SuiteResult =>
    new SuiteResult({title, scenarios} as Suite);

const run = (id: string, suite: SuiteResult, index = 1): SuiteRun => ({
    id,
    suite,
    suiteTitle: suite.name,
    testeeName: `testee-${index}`,
    executionIndex: index,
    startedAt: Date.now()
});

test('Summary totals count suites, scenarios, and actions once', t => {
    const first = step('first');
    const second = step('second');
    const scenarioResult = new ScenarioResult(scenario('scenario', [first, second]));
    scenarioResult.add(new StepOutcome(first).update(Outcome.succeeded));
    scenarioResult.add(new StepOutcome(second).update(Outcome.timedout, 'timeout'));

    const suite = suiteResult('suite', [scenario('scenario', [first, second])]);
    suite.add(scenarioResult);

    const summary = summarize([suite]);

    t.deepEqual(summary.suites, {passing: 0, failing: 1, skipped: 0, total: 1});
    t.deepEqual(summary.scenarios, {passing: 0, failing: 1, skipped: 0, errors: 0, total: 1});
    t.deepEqual(summary.actions, {passing: 1, failing: 0, skipped: 0, timeouts: 1, errors: 0, total: 2});
});

test('Aggregate results treat child errors as failures, not skipped', t => {
    const passingScenario = new ScenarioResult(scenario('passing-scenario'));
    passingScenario.add(new StepOutcome(step('passing-step')).update(Outcome.succeeded));

    const errorScenario = new ScenarioResult(scenario('error-scenario'));
    errorScenario.add(new StepOutcome(step('error-step')).update(Outcome.error, 'missing field'));

    const suite = suiteResult('suite', [scenario('passing-scenario'), scenario('error-scenario')]);
    suite.add(passingScenario);
    suite.add(errorScenario);

    const summary = summarize([suite]);

    t.is(errorScenario.outcome, Outcome.failed);
    t.is(suite.outcome, Outcome.failed);
    t.deepEqual(summary.suites, {passing: 0, failing: 1, skipped: 0, total: 1});
    t.deepEqual(summary.scenarios, {passing: 1, failing: 1, skipped: 0, errors: 0, total: 2});
    t.deepEqual(summary.actions, {passing: 1, failing: 0, skipped: 0, timeouts: 0, errors: 1, total: 2});
});

test('ArchiveWriter preserves archive fields', t => {
    const previous = process.env.TESTFILE;
    const temp = mkdtempSync(join(tmpdir(), 'latch-reporter-'));
    process.env.TESTFILE = join(temp, 'suite.asserts.wast');

    try {
        const sc = new ScenarioResult(scenario('passing'));
        sc.add(new StepOutcome(step('step')).update(Outcome.succeeded));
        const suite = suiteResult('suite');
        suite.add(sc);

        const writer = new ArchiveWriter(1234);
        writer.write(42.4, [suite]);

        const archived = JSON.parse(readFileSync(writer.archive, 'utf8'));
        t.is(archived['duration (ms)'], 42);
        t.deepEqual(archived.passes, ['passing']);
        t.is(archived['passed scenarios'], 1);
        t.is(archived['skipped scenarios'], 0);
        t.is(archived['failed scenarios'], 0);
    } finally {
        if (previous === undefined) {
            delete process.env.TESTFILE;
        } else {
            process.env.TESTFILE = previous;
        }
        rmSync(temp, {recursive: true, force: true});
    }
});

test('ReporterState keeps active step visible before scenario and suite completion', t => {
    const state = new ReporterState();
    const suite = suiteResult();
    const sc = new ScenarioResult(scenario('scenario'));
    const outcome = new StepOutcome(step('visible')).update(Outcome.succeeded);

    state.start();
    state.suiteStarted(run('run-1', suite));
    state.scenarioStarted('run-1', sc);
    sc.add(outcome);
    state.stepFinished('run-1', sc, outcome);

    const active = state.snapshot().activeRuns[0];
    t.is(active.activeScenario, sc);
    t.is(active.lastStep, outcome);
    t.deepEqual(active.scenarios, [sc]);
    t.is(state.snapshot().completedRuns.length, 0);

    state.scenarioFinished('run-1', sc);
    suite.add(sc);
    state.suiteFinished('run-1', suite);

    t.is(state.snapshot().activeRuns.length, 0);
    t.is(state.snapshot().completedRuns[0].suite, suite);
});

test.serial('ReporterFactory falls back to plain reporter for non-TTY stdout and GitHub style', t => {
    const descriptor = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
    Object.defineProperty(process.stdout, 'isTTY', {value: false, configurable: true});

    try {
        t.true(ReporterFactory.create(StyleType.plain, Verbosity.normal, ReporterSelection.auto) instanceof PlainReporter);

        Object.defineProperty(process.stdout, 'isTTY', {value: true, configurable: true});
        t.true(ReporterFactory.create(StyleType.github, Verbosity.normal, ReporterSelection.auto) instanceof PlainReporter);
        t.true(ReporterFactory.create(StyleType.plain, Verbosity.normal, ReporterSelection.ink) instanceof InkReporter);
    } finally {
        if (descriptor) {
            Object.defineProperty(process.stdout, 'isTTY', descriptor);
        } else {
            delete (process.stdout as unknown as {isTTY?: boolean}).isTTY;
        }
    }
});

test('Ink App applies running verbosity levels', t => {
    const activeSuite = suiteResult('active-suite');
    const activeScenario = new ScenarioResult(scenario('active-scenario'));
    const activeStep = new StepOutcome(step('active-step')).update(Outcome.succeeded);
    activeScenario.add(activeStep);

    const completedSuite = suiteResult('completed-suite');
    const failedScenario = new ScenarioResult(scenario('failed-scenario'));
    const failedStep = new StepOutcome(step('failed-step')).update(Outcome.failed, 'Expected 1 got 2');
    failedScenario.add(failedStep);
    completedSuite.add(failedScenario);

    const state = new ReporterState();
    state.start();
    state.suiteStarted(run('active', activeSuite));
    state.scenarioStarted('active', activeScenario);
    state.stepFinished('active', activeScenario, activeStep);
    state.suiteStarted(run('completed', completedSuite, 2));
    state.suiteFinished('completed', completedSuite);

    const normal = render(React.createElement(App, {
        snapshot: state.snapshot(),
        archive: 'suite.log',
        verbosity: Verbosity.normal
    })).lastFrame() ?? '';

    const more = render(React.createElement(App, {
        snapshot: state.snapshot(),
        archive: 'suite.log',
        verbosity: Verbosity.more
    })).lastFrame() ?? '';

    t.true(normal.includes('active-suite'));
    t.true(normal.includes('active-scenario'));
    t.false(normal.includes('active-step'));
    t.true(normal.includes('completed-suite'));
    t.false(normal.includes('Expected 1 got 2'));
    t.true(normal.includes('Progress'));

    t.true(more.includes('active-step'));
    t.true(more.includes('Expected 1 got 2'));
});

test('Ink App renders compact final summary at the bottom', t => {
    const completedSuite = suiteResult('completed-suite');
    const passedScenario = new ScenarioResult(scenario('passed-scenario'));
    for (let i = 0; i < 10; i++) {
        passedScenario.add(new StepOutcome(step(`passed-step-${i}`)).update(Outcome.succeeded));
    }
    completedSuite.add(passedScenario);

    const state = new ReporterState();
    state.start();
    state.suiteStarted(run('completed', completedSuite, 2));
    state.suiteFinished('completed', completedSuite);
    state.finish(12);

    const app = render(React.createElement(App, {
        snapshot: state.snapshot(),
        archive: 'suite.log',
        verbosity: Verbosity.normal
    }));

    const frame = app.lastFrame() ?? '';
    t.true(frame.includes('PASS 1 suites passed · 1 scenarios · 10 actions · 12ms'));
    t.true(frame.includes('PASS completed-suite'));
    t.regex(frame, /PASS completed-suite\s+1\/1\s+testee-2/);
    t.true(frame.includes('Suites'));
    t.true(frame.includes('Scenarios'));
    t.true(frame.includes('Actions'));
    t.true(frame.includes('Archive  suite.log'));
    t.false(frame.includes('passed-step-0'));

    const overviewRows = frame.split('\n').filter((line) => line.includes('passed') && line.includes('failed'));
    t.is(overviewRows.length, 3);
    t.deepEqual(overviewRows.map((line) => line.indexOf('·')), [overviewRows[0].indexOf('·'), overviewRows[0].indexOf('·'), overviewRows[0].indexOf('·')]);
});

test('Ink App shows failed scenarios under suite rows for normal final verbosity', t => {
    const completedSuite = suiteResult('completed-suite');
    const failedScenario = new ScenarioResult(scenario('failed-scenario'));
    failedScenario.add(new StepOutcome(step('failed-step')).update(Outcome.failed, 'Expected 1 got 2'));
    completedSuite.add(failedScenario);

    const state = new ReporterState();
    state.start();
    state.suiteStarted(run('completed', completedSuite, 2));
    state.suiteFinished('completed', completedSuite);
    state.finish(12);

    const normal = render(React.createElement(App, {
        snapshot: state.snapshot(),
        archive: 'suite.log',
        verbosity: Verbosity.normal
    })).lastFrame() ?? '';

    const minimal = render(React.createElement(App, {
        snapshot: state.snapshot(),
        archive: 'suite.log',
        verbosity: Verbosity.minimal
    })).lastFrame() ?? '';

    t.true(normal.includes('FAIL completed-suite'));
    t.true(normal.includes('└─ failed-scenario'));
    t.true(normal.indexOf('└─ failed-scenario') > normal.indexOf('FAIL completed-suite'));
    t.false(normal.includes('failed-step'));
    t.false(normal.includes('Expected 1 got 2'));
    t.false(minimal.includes('failed-scenario'));
});

test('Ink App expands failed actions for more and full history for all final verbosity', t => {
    const completedSuite = suiteResult('completed-suite');
    const passedScenario = new ScenarioResult(scenario('passed-scenario'));
    passedScenario.add(new StepOutcome(step('passed-step')).update(Outcome.succeeded));
    const failedScenario = new ScenarioResult(scenario('failed-scenario'));
    failedScenario.add(new StepOutcome(step('failed-step')).update(Outcome.failed, 'Expected 1 got 2'));
    completedSuite.add(passedScenario);
    completedSuite.add(failedScenario);

    const state = new ReporterState();
    state.start();
    state.suiteStarted(run('completed', completedSuite, 2));
    state.suiteFinished('completed', completedSuite);
    state.finish(12);

    const more = render(React.createElement(App, {
        snapshot: state.snapshot(),
        archive: 'suite.log',
        verbosity: Verbosity.more
    })).lastFrame() ?? '';

    const all = render(React.createElement(App, {
        snapshot: state.snapshot(),
        archive: 'suite.log',
        verbosity: Verbosity.all
    })).lastFrame() ?? '';

    t.true(more.includes('└─ failed-scenario'));
    t.true(more.includes('└─ FAIL failed-step'));
    t.true(more.includes('Expected 1 got 2'));
    t.false(more.includes('passed-step'));

    t.true(all.includes('passed-scenario'));
    t.true(all.includes('PASS passed-step'));
    t.true(all.includes('failed-scenario'));
    t.true(all.includes('FAIL failed-step'));
});

test('Ink App debug final verbosity is all plus framework and log details', t => {
    const completedSuite = suiteResult('completed-suite');
    const passedScenario = new ScenarioResult(scenario('passed-scenario'));
    passedScenario.add(new StepOutcome(step('passed-step')).update(Outcome.succeeded));
    const failedScenario = new ScenarioResult(scenario('failed-scenario'));
    failedScenario.add(new StepOutcome(step('failed-step')).update(Outcome.failed, 'Expected 1 got 2'));
    completedSuite.add(passedScenario);
    completedSuite.add(failedScenario);

    const state = new ReporterState();
    state.start();
    state.log('info', 'framework info');
    state.log('debug', 'debug frame');
    state.suiteStarted(run('completed', completedSuite, 2));
    state.suiteFinished('completed', completedSuite);
    state.finish(12);

    const debug = render(React.createElement(App, {
        snapshot: state.snapshot(),
        archive: 'suite.log',
        verbosity: Verbosity.debug
    })).lastFrame() ?? '';

    t.true(debug.includes('Latch'));
    t.true(debug.includes('archive suite.log'));
    t.true(debug.includes('passed-scenario'));
    t.true(debug.includes('PASS passed-step'));
    t.true(debug.includes('failed-scenario'));
    t.true(debug.includes('FAIL failed-step'));
    t.true(debug.includes('Logs'));
    t.true(debug.includes('info: framework info'));
    t.true(debug.includes('debug: debug frame'));
});

test('Ink App respects debug verbosity for logs', t => {
    const state = new ReporterState();
    state.start();
    state.log('debug', 'debug-only');
    state.log('info', 'info-visible');

    const normal = render(React.createElement(App, {
        snapshot: state.snapshot(),
        archive: 'suite.log',
        verbosity: Verbosity.normal
    })).lastFrame() ?? '';

    const debug = render(React.createElement(App, {
        snapshot: state.snapshot(),
        archive: 'suite.log',
        verbosity: Verbosity.debug
    })).lastFrame() ?? '';

    t.false(normal.includes('debug-only'));
    t.true(normal.includes('info-visible'));
    t.true(debug.includes('debug-only'));
});

test('Framework run IDs distinguish parallel testees by execution index', t => {
    const framework = Framework.getImplementation() as unknown as {runId: (suite: {title: string}, testee: {name: string}, executionIndex: number) => string};

    t.not(framework.runId({title: 'suite'}, {name: 'testee'}, 1), framework.runId({title: 'suite'}, {name: 'testee'}, 2));
});

test.serial('Framework.analyse waits for reporter cleanup before process exit', async t => {
    const framework = Framework.getImplementation() as unknown as {reporter: Reporter; analyse: (suite: Suite[], runs?: number) => void};
    const originalReporter = framework.reporter;
    const originalExit = process.exit;
    let closed = false;
    let exitedAfterClose = false;
    let exitCode: string | number | null | undefined;

    framework.reporter = {
        start() {},
        suiteStarted() {},
        scenarioStarted() {},
        stepFinished() {},
        scenarioFinished() {},
        suiteFinished() {},
        info() {},
        error() {},
        debug() {},
        finish() {},
        async close() {
            await new Promise(resolve => setTimeout(resolve, 5));
            closed = true;
        },
        style() {},
        styling() {
            return StyleType.plain;
        },
        verbosity() {}
    };

    process.exit = ((code?: string | number | null | undefined) => {
        exitCode = code;
        exitedAfterClose = closed;
        return undefined as never;
    }) as typeof process.exit;

    try {
        framework.analyse([], 1);
        await new Promise(resolve => setTimeout(resolve, 20));
        t.true(exitedAfterClose);
        t.is(exitCode, 0);
    } finally {
        framework.reporter = originalReporter ?? new AutoReporter();
        process.exit = originalExit;
    }
});
