import {EMULATOR, EmulatorBridge, Framework, Invoker, Step, Type, Value} from '../src';

const framework = Framework.getImplementation();

framework.platform(new EmulatorBridge(EMULATOR));

framework.suite('Test Latch performance in CI');

const steps: Step[] = [];

// ✔ ((invoke "8u_good1" (i32.const 0)) (i32.const 97))
steps.push(new Invoker('8u_good1', [{value: 0, type: Type.i32}] as Value[], 97));

// ✔ ((invoke "8u_good3" (i32.const 0)) (i32.const 98))
steps.push(new Invoker('8u_good3', [{value: 0, type: Type.i32}] as Value[], 98));

framework.test({
    title: `Test with address_0.wast`,
    program: 'test/address.wast',
    dependencies: [],
    steps: steps
});

framework.run();
