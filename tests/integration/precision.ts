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

precision.test({
    title: 'i64 rem_s returns zero for INT64_MIN modulo -1',
    program: 'tests/integration/precision.wast',
    dependencies: [],
    steps: [
        new Invoker('rem_s', [
            WASM.i64(-9223372036854775808n),
            WASM.i64(-1n)
        ], WASM.i64(0n))
    ]
});

framework.reporter.verbosity(Verbosity.more);
framework.analyse([precision]);
