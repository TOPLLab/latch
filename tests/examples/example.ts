import {
    Description,
    EmulatorSpecification,
    Expected,
    Framework,
    Invoker,
    Kind,
    Message,
    OutofPlaceSpecification,
    Step,
    Target,
    WASM
} from '../../src/index';
import dump = Message.dump;
import stepOver = Message.stepOver;
import step = Message.step;

const framework = Framework.getImplementation();

const spec = framework.suite('Test Wasm spec'); // must be called first

spec.testee('emulator[:8100]', new EmulatorSpecification(8100));

const steps: Step[] = [];

// ✔ ((invoke "8u_good1" (i32.const 0)) (i32.const 97))
steps.push(new Invoker('8u_good1', [WASM.i32(0)], WASM.i32(97)));

// ✔ ((invoke "8u_good3" (i32.const 0)) (i32.const 98))
steps.push(new Invoker('8u_good3', [WASM.i32(0)], WASM.i32(98)));

// ✔ ((invoke "func-unwind-by-br"))
steps.push(new Invoker('func-unwind-by-br', [], undefined));

spec.test({
    title: `Test with address_0.wast`,
    program: 'tests/examples/address.wast',
    dependencies: [],
    steps: steps
});

const debug = framework.suite('Test Debugger interface');
debug.testee('emulator[:8150]', new EmulatorSpecification(8150));

debug.test({
    title: 'Test STEP OVER',
    program: 'tests/examples/call.wast',
    steps: [{
        title: 'Send DUMP command',
        instruction: {kind: Kind.Request, value: dump}
    }, {
        title: 'Send STEP OVER command',
        instruction: {kind: Kind.Request, value: stepOver}
    }, {
        title: 'CHECK: execution stepped over direct call',
        instruction: {kind: Kind.Request, value: dump},
        expected: [{'pc': {kind: 'primitive', value: 169} as Expected<number>}]
    }, {
        title: 'Send STEP OVER command',
        instruction: {kind: Kind.Request, value: stepOver}
    }, {
        title: 'CHECK: execution took one step',
        instruction: {kind: Kind.Request, value: dump},
        expected: [{'pc': {kind: 'primitive', value: 171} as Expected<number>}]
    }, {
        title: 'Send STEP OVER command',
        instruction: {kind: Kind.Request, value: stepOver}
    }, {
        title: 'CHECK: execution stepped over indirect call',
        instruction: {kind: Kind.Request, value: dump},
        expected: [{'pc': {kind: 'primitive', value: 174} as Expected<number>}]
    }]
});

const DUMP: Step = {
    title: 'Send DUMP command',
    instruction: {kind: Kind.Request, value: Message.dump},
    expected: [
    {'pc': {kind: 'description', value: Description.defined} as Expected<string>},
    {
        'breakpoints': {
            kind: 'comparison', value: (state: Object, value: Array<any>) => {
                return value.length === 0;
            }, message: 'list of breakpoints should be empty'
        } as Expected<Array<any>>
    },
    {'callstack[0].sp': {kind: 'primitive', value: -1} as Expected<number>},
    {'callstack[0].fp': {kind: 'primitive', value: -1} as Expected<number>}]
};

debug.test({
    title: 'Test DUMP blink',
    program: `tests/examples/blink.wast`,
    steps: [DUMP]
});

framework.run([spec, debug]).then(() => process.exit(0));
