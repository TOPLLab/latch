import {Framework, Invoker, PlatformType, Step, WASM} from '../src';

const framework = Framework.getImplementation();

framework.testbed('emulator', PlatformType.emulator);

framework.suite('Test Latch performance in CI');

const steps: Step[] = [];

// ✔ ((invoke "8u_good1" (i32.const 0)) (i32.const 97))
steps.push(new Invoker('8u_good1', [{value: 0, type: WASM.Type.i32}] as WASM.Value[], 97));

// ✔ ((invoke "8u_good3" (i32.const 0)) (i32.const 98))
steps.push(new Invoker('8u_good3', [{value: 0, type: WASM.Type.i32}] as WASM.Value[], 98));

framework.test({
    title: `Test with address_0.wast`,
    program: 'test/address.wast',
    dependencies: [],
    steps: steps
});

framework.run();
