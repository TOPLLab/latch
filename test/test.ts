import {ArduinoSpecification, EmulatorSpecification, Expected, Framework, Kind, Message, Step} from '../src';
import dump = Message.dump;
import stepOver = Message.stepOver;

const framework = Framework.getImplementation();

framework.testee('emulator [:8500]', new EmulatorSpecification(8500));
framework.testee('emulator [:8520]', new EmulatorSpecification(8520));
framework.testee('esp wrover', new ArduinoSpecification('/dev/ttyUSB0', 'esp32:esp32:esp32wrover'));

framework.suite('Test Latch performance in CI');

const steps: Step[] = [];

framework.test({
    title: `Test with address_0.wast`,
    program: 'test/address.wast',
    dependencies: [],
    steps: steps
});

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
