import {EmulatorSpecification, Expected, Framework, Invoker, Kind, Message, OopSuite, Step, WASM} from '../src';
import {Testee} from '../src/testbeds/Testee';
import dump = Message.dump;
import stepOver = Message.stepOver;

const framework = Framework.getImplementation();

const oop: OopSuite = framework.oop.suite('Integration tests: out-of-place dummy call');

oop.test((_: Testee, proxy: Testee) => {
    return {
        title: 'Test STEP OVER',
        program: 'test/call.wast',
        steps: [{
            title: 'Send DUMP command',
            instruction: {kind: Kind.Request, value: dump},
            target: proxy
        }]
    }
});

oop.testbed('out-of-place [:8450] - [8400]', new EmulatorSpecification(8450), new EmulatorSpecification(8400));

framework.run([oop]);

//

const spec = framework.single.suite('Test Wasm spec'); // must be called first

spec.testee('emulator [:8500]', new EmulatorSpecification(8500));

const steps: Step[] = [];

// ✔ ((invoke "8u_good1" (i32.const 0)) (i32.const 97))
steps.push(new Invoker('8u_good1', [WASM.i32(0)], WASM.i32(97)));

// ✔ ((invoke "8u_good3" (i32.const 0)) (i32.const 98))
steps.push(new Invoker('8u_good3', [WASM.i32(0)], WASM.i32(98)));

spec.test({
    title: `Test with address_0.wast`,
    program: 'test/address.wast',
    dependencies: [],
    steps: steps
});

const debug = framework.single.suite('Test Debugger interface');
debug.testee('emulator [:8520]', new EmulatorSpecification(8520));
// framework.testee('esp wrover', new ArduinoSpecification('/dev/ttyUSB0', 'esp32:esp32:esp32wrover'));

debug.test({
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

framework.run([spec, debug]);
