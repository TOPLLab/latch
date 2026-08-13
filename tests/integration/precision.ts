import {
    EmulatorSpecification,
    Framework,
    Invoker,
    Verbosity,
    WASM
} from '../../src/index';

const framework = Framework.getImplementation();

const precision = framework.suite('Test i64 precision');

precision.testee('emulator[:8100]', new EmulatorSpecification(8100));

const maxI64 = 9223372036854775807n;

precision.test({
    title: 'Preserve i64 precision outside the JavaScript safe integer range',
    program: 'tests/integration/precision.wast',
    dependencies: [],
    steps: [
        new Invoker('i64_get_max', [], WASM.i64(maxI64)),
        new Invoker('i64_eq_max', [WASM.i64(maxI64)], WASM.i32(1n)),
        new Invoker('i64_eq_max_wrong', [WASM.i64(maxI64)], WASM.i32(0n))
    ]
});

framework.reporter.verbosity(Verbosity.more);
framework.analyse([precision]);
