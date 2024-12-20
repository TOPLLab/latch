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

spec.testee('emulator[:8500]', new EmulatorSpecification(8500));

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
debug.testee('emulator[:8520]', new EmulatorSpecification(8520));
debug.testee('emulator[:8522]', new EmulatorSpecification(8522));
// debug.testee('esp wrover', new ArduinoSpecification('/dev/ttyUSB0', 'esp32:esp32:esp32wrover'), new HybridScheduler(), {connectionTimout: 0});

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

const primitives = framework.suite('Test primitives');

primitives.testee('debug[:8700]', new EmulatorSpecification(8700));

primitives.test({
    title: `Test store primitive`,
    program: 'tests/examples/dummy.wast',
    dependencies: [],
    steps: [{
        title: 'CHECK: execution at start of main',
        instruction: {kind: Kind.Request, value: dump},
        expected: [{'pc': {kind: 'primitive', value: 129} as Expected<number>}]
    },

        new Invoker('load', [WASM.i32(32)], WASM.i32(0)),

        {
            title: 'Send STEP command',
            instruction: {kind: Kind.Request, value: step}
        },

        {
            title: 'Send STEP command',
            instruction: {kind: Kind.Request, value: step}
        },

        {
            title: 'Send STEP command',
            instruction: {kind: Kind.Request, value: step}
        },

        new Invoker('load', [WASM.i32(32)], WASM.i32(42))
    ]
})

const oop = framework.suite('Test Out-of-place primitives');

oop.testee('supervisor[:8100] - proxy[:8150]', new OutofPlaceSpecification(8100, 8150));

oop.test({
    title: `Test store primitive`,
    program: 'tests/examples/dummy.wast',
    dependencies: [],
    steps: [
        {
            title: '[supervisor] CHECK: execution at start of main',
            instruction: {kind: Kind.Request, value: dump},
            expected: [{'pc': {kind: 'primitive', value: 129} as Expected<number>}]
        },

        {
            title: '[proxy]      CHECK: execution at start of main',
            instruction: {kind: Kind.Request, value: dump},
            expected: [{'pc': {kind: 'primitive', value: 129} as Expected<number>}],
            target: Target.proxy
        },

        new Invoker('load', [WASM.i32(32)], WASM.i32(0), Target.proxy),

        {
            title: '[supervisor] Send STEP command',
            instruction: {kind: Kind.Request, value: step}
        },

        {
            title: '[supervisor] Send STEP command',
            instruction: {kind: Kind.Request, value: step}
        },

        {
            title: '[supervisor] Send STEP command',
            instruction: {kind: Kind.Request, value: step}
        },

        {
            title: '[supervisor] CHECK: execution took three steps',
            instruction: {kind: Kind.Request, value: dump},
            expected: [{'pc': {kind: 'primitive', value: 136} as Expected<number>}]
        },

        new Invoker('load', [WASM.i32(32)], WASM.i32(42), Target.proxy),

        new Invoker('load', [WASM.i32(32)], WASM.i32(42), Target.supervisor)
    ]
});


framework.run([spec, debug, primitives, oop]).then(() => process.exit(0));
