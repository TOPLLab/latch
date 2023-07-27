import {EMULATOR, EmulatorBridge} from './warduino.bridge';
import {Expected, Framework, Instruction, Step, Type, Value} from '../src';

const framework = Framework.getImplementation();

framework.platform(new EmulatorBridge(EMULATOR));

framework.suite('Test Latch performance in CI');

const steps: Step[] = [];

steps.push({
    // ✔ ((invoke "8u_good1" (i32.const 0)) (i32.const 97))
    title: '8u_good1 0 97',
    instruction: Instruction.invoke,
    payload: {name: '8u_good1', args: [{value: 0, type: Type.i32} as Value]},
    expected: [{'value': {kind: 'primitive', value: 97} as Expected<number>}]
});

steps.push({
    // ✔ ((invoke "8u_good3" (i32.const 0)) (i32.const 98))
    title: '8u_good3 0 97',
    instruction: Instruction.invoke,
    payload: {name: '8u_good3', args: [{value: 0, type: Type.i32} as Value]},
    expected: [{'value': {kind: 'primitive', value: 98} as Expected<number>}]
});

framework.test({
    title: `Test with address_0.wast`,
    program: 'test/address.wast',
    dependencies: [],
    steps: steps
});

framework.run();
