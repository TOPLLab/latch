import test from 'ava';
import {PassThrough} from 'node:stream';
import {SubProcess} from '../../src/bridge/SubProcess';
import {Message} from '../../src/messaging/Message';
import {SourceMap} from '../../src/sourcemap/SourceMap';
import {Platform} from '../../src/testbeds/Platform';

class TestPlatform extends Platform {
    readonly name = 'test';
    connection: SubProcess;

    constructor(channel: PassThrough) {
        super();
        this.connection = new SubProcess(channel);
        this.listen();
    }
}

// file is currently excluded from tests

test('[warduino] start emulator', t => {
    t.pass();
});

test('[platform] rejects outstanding requests when the connection closes with an error', async t => {
    const channel = new PassThrough();
    const platform = new TestPlatform(channel);
    const expected = new Error('read ECONNRESET');
    const request = platform.sendRequest(new SourceMap.Mapping(), Message.run);

    channel.emit('error', expected);

    t.is(await t.throwsAsync(request), expected);
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
