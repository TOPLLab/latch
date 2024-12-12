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


framework.run([oop]).then(() => process.exit(0));
