import test from 'ava';
import {
    MinimalScenarioDescriber,
    NormalScenarioDescriber,
    ShortScenarioDescriber
} from '../../src/reporter/describers/ScenarioDescribers';
import {ScenarioResult, StepOutcome, SuiteResult} from '../../src/reporter/Results';
import {Kind, Message, Step} from '../../src';
import {Outcome} from '../../src/reporter/describers/Describer';
import {Plain} from '../../src/reporter/Style';

const steps: Step[] = [
    {
        title: 'Send DUMP command',
        instruction: {kind: Kind.Request, value: Message.dump},
        expected: [{'pc': {kind: 'comparison', value: (_: Object, value: number) => value > 0}}]
    }, {
        title: 'Send STEP OVER command',
        instruction: {kind: Kind.Request, value: Message.stepOver}
    }
];
const dummy = new ScenarioResult({
    title: 'Scenario title', program: 'artifacts/blink.wat', steps: steps
});

test('[MinimalScenarioDescriber] : test printing', t => {
    const describer = new MinimalScenarioDescriber(dummy);
    dummy.aggregate([new StepOutcome(steps[0]).update(Outcome.succeeded), new StepOutcome(steps[1]).update(Outcome.succeeded)]);
    t.is(describer.describe(new Plain()).join('\n'), '\x1B[1m\x1B[34mscenario.\x1B[39m\x1B[22m \x1B[1mScenario title\x1B[22m \n');
});

test('[ShortScenarioDescriber] : test printing', t => {
    const describer = new ShortScenarioDescriber(dummy);
    const output = describer.describe(new Plain()).join('\n');
    t.is(output, '\x1B[1m\x1B[34mscenario.\x1B[39m\x1B[22m \x1B[1mScenario title\x1B[22m \n');
    t.false(['Send DUMP command', 'Send STEP OVER command'].some((element) => output.includes(element)));
});

test('[NormalScenarioDescriber] : test printing', t => {
    let output = new NormalScenarioDescriber(dummy).describe(new Plain()).join('\n');
    t.true(['PASS', 'Send DUMP command', 'Send STEP OVER command'].every((element) => output.includes(element)));
    t.false(['FAIL'].some((element) => output.includes(element)));
    dummy.aggregate([new StepOutcome(steps[0]).update(Outcome.failed), new StepOutcome(steps[1]).update(Outcome.succeeded)]);
    output = new NormalScenarioDescriber(dummy).describe(new Plain()).join('\n');
    t.true(['FAIL', 'Send DUMP command', 'PASS', 'Send STEP OVER command'].every((element) => output.includes(element)));
});
