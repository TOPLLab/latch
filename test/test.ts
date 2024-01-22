import {ArduinoSpecification, EmulatorSpecification, Expected, Framework, Invoker, Kind, Message, Step, WASM} from '../src/index';
import dump = Message.dump;
import stepOver = Message.stepOver;

const framework = Framework.getImplementation();

framework.suite('Test Wasm spec'); // must be called first

framework.testee('emulator [:8500]', new EmulatorSpecification(8500));

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

framework.suite('Test Debugger interface');
framework.testee('emulator [:8520]', new EmulatorSpecification(8520));
// framework.testee('esp wrover', new ArduinoSpecification('/dev/ttyUSB0', 'esp32:esp32:esp32wrover'));


framework.test({
    title: 'Test STEP OVER',
    program: 'test/call.wast',
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

framework.run();
