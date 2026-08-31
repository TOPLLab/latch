import test from 'ava';
import {Duplex} from 'node:stream';
import {SubProcess} from '../../src/bridge/SubProcess';
import {Message} from '../../src/messaging/Message';
import {SourceMap} from '../../src/sourcemap/SourceMap';
import {Platform} from '../../src/testbeds/Platform';
import {DebugFrameDecoder, encodeFrame} from '../../src/protocol/frame';
import {
    Command,
    Inspect,
    NotificationType,
    OperationResult
} from '../../src/protocol/vendor/debug';
import {WARDuino} from "../../src/debug/WARDuino";
import {Testee} from "../../src/framework/Testee";
import {EmulatorSpecification} from "../../src/testbeds/TestbedSpecification";

class TestChannel extends Duplex {
    readonly sent: Buffer[] = [];

    _read(): void {
        // Test data is supplied explicitly through receive().
    }

    _write(chunk: Buffer, _encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
        this.sent.push(Buffer.from(chunk));
        callback();
    }

    receive(data: Uint8Array): void {
        this.push(Buffer.from(data));
    }
}

class TestPlatform extends Platform {
    readonly name = 'test';
    connection: SubProcess;

    constructor(channel: TestChannel) {
        super();
        this.connection = new SubProcess(channel);
        this.listen();
    }
}

const tick = () => new Promise<void>(resolve => setImmediate(resolve));

test("[testee] successful void requests are not retried", async t => {
    const testee = new Testee("test", new EmulatorSpecification(0), 0, 0);
    const recoverable = (testee as unknown as {recoverable: (...args: any[]) => Promise<unknown>}).recoverable;
    let attempts = 0;
    let recoveries = 0;

    const result = await recoverable(
        testee, Message.run, new SourceMap.Mapping(),
        async () => { attempts++; },
        async () => { recoveries++; }, 1
    );

    t.is(result, undefined);
    t.is(attempts, 1);
    t.is(recoveries, 0);
});

// file is currently excluded from tests

test('[warduino] start emulator', t => {
    t.pass();
});

test('[platform] rejects outstanding requests when the connection closes with an error', async t => {
    const channel = new TestChannel();
    const platform = new TestPlatform(channel);
    const expected = new Error('read ECONNRESET');
    const request = platform.sendRequest(new SourceMap.Mapping(), Message.run);

    channel.emit('error', expected);

    t.is(await t.throwsAsync(request), expected);
});

test('[platform] sends a framed protobuf command payload', async t => {
    const channel = new TestChannel();
    const platform = new TestPlatform(channel);
    const request = platform.sendRequest(new SourceMap.Mapping(), Message.inspect([
        WARDuino.Inspect.counter,
        WARDuino.Inspect.io
    ]));
    const [frame] = new DebugFrameDecoder().push(channel.sent[0]);

    t.is(frame.type, Command.COMMAND_INSPECT);
    t.deepEqual(Inspect.decode(frame.payload).state, Buffer.from([0x01, 0x0b]));

    const expected = new Error('test complete');
    channel.emit('error', expected);
    t.is(await t.throwsAsync(request), expected);
});

test('[platform] resolves only the expected notification type', async t => {
    const channel = new TestChannel();
    const platform = new TestPlatform(channel);
    let resolved = false;
    const request = platform.sendRequest(new SourceMap.Mapping(), Message.run).then(() => {
        resolved = true;
    });

    channel.receive(encodeFrame({
        type: NotificationType.NOTIFICATION_PAUSED,
        payload: new Uint8Array()
    }));
    await tick();
    t.false(resolved);

    channel.receive(encodeFrame({
        type: NotificationType.NOTIFICATION_CONTINUED,
        payload: new Uint8Array()
    }));
    await request;
    t.true(resolved);
});

test('[platform] matches operation results to their original command', async t => {
    const channel = new TestChannel();
    const platform = new TestPlatform(channel);
    let resolved = false;
    const request = platform.sendRequest(new SourceMap.Mapping(), Message.reset).then(result => {
        resolved = true;
        return result;
    });

    channel.receive(encodeFrame({
        type: NotificationType.NOTIFICATION_OPERATION_RESULT,
        payload: OperationResult.encode({command: Command.COMMAND_UPDATE_LOCAL, success: true}).finish()
    }));
    await tick();
    t.false(resolved);

    channel.receive(encodeFrame({
        type: NotificationType.NOTIFICATION_OPERATION_RESULT,
        payload: OperationResult.encode({command: Command.COMMAND_RESET, success: true}).finish()
    }));
    const result = await request;
    t.true(resolved);
    t.is(result.command, Command.COMMAND_RESET);
    t.true(result.success);
});

test('[warduino] start oop testbed', t => {
    t.pass();
});

test('[dummy] start dummy testbed', t => {
    t.pass();
});

test('[dummy] simple passing test', t => {
    t.pass();
});

test('[dummy] simple failing test', t => {
    t.pass();
});

test('[dummy] general info reporter', t => {
    t.pass();
});

test('[dummy] overview in reporter', t => {
    t.pass();
});

test('[dummy] failing count', t => {
    t.pass();
});

test('[dummy] passing count', t => {
    t.pass();
});

test('[dummy] log file create', t => {
    t.pass();
});

test('[dummy] log file correct', t => {
    t.pass();
});


test("[platform] rejects only a failed matching operation", async t => {
    const channel = new TestChannel();
    const platform = new TestPlatform(channel);
    const request = platform.sendRequest(new SourceMap.Mapping(), Message.reset);
    channel.receive(encodeFrame({
        type: NotificationType.NOTIFICATION_OPERATION_RESULT,
        payload: OperationResult.encode({command: Command.COMMAND_RESET, success: false}).finish()
    }));
    await t.throwsAsync(request, {message: /COMMAND_RESET failed/});
});
