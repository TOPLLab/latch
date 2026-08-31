import test from 'ava';
import {MessageQueue} from '../../src/messaging/MessageQueue';
import {Message} from '../../src/messaging/Message';
import {WASM} from '../../src/sourcemap/Wasm';
import {SourceMap} from '../../src/sourcemap/SourceMap';
import {Command, FunctionMessage, Range, RemoteFunctionCall, RemoteFunctionResult, ValueUpdate} from "../../src/protocol/vendor/debug";

const alphanumerical = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');

test('[Message.invoke] : encode 64-bit integer arguments without precision loss', t => {
    const mapping = new SourceMap.Mapping().init([], [{
        index: 0,
        name: 'rem_s',
        arguments: [],
        locals: []
    }], [], []);
    const request = Message.invoke('rem_s', [
        WASM.i64(-9223372036854775808n),
        WASM.i64(-1n)
    ]);

    const payload = RemoteFunctionCall.decode(request.payload!(mapping));
    t.is(payload.functionIndex, 0);
    t.deepEqual(payload.arguments.map(({i64Bits, index}) => ({i64Bits, index})), [
        {i64Bits: 0x8000000000000000n, index: 0},
        {i64Bits: 0xffffffffffffffffn, index: 1}
    ]);
});

test("[Message.invoke] : decodes an i64 reply to the legacy value contract", t => {
    const request = Message.invoke("unused", []);
    const result = request.parser(RemoteFunctionResult.encode({
        success: true,
        results: [{i64Bits: 0n, index: 0}],
        error: Buffer.alloc(0)
    }).finish());

    t.false("text" in result);
    if ("text" in result) return;
    t.is(result.type, WASM.Integer.i64);
    t.is((result.value as WASM.WasmInt).toBigInt(), 0n);
    t.false("success" in result);
});

test("[MessageQueue] : test EOM detection", t => {
    const fuzzer = fuzzy(alphanumerical);
    const newline = new MessageQueue('\n');
    newline.push(fuzzer(9));
    t.false(newline.hasCompleteMessage());
    for (let i = 0; i < 5; i++) {
        newline.push(fuzzer(20));
    }
    t.false(newline.hasCompleteMessage());
    newline.push('\n');
    t.true(newline.hasCompleteMessage());

    const semicolon = new MessageQueue(';');
    t.false(semicolon.hasCompleteMessage());
    semicolon.push(fuzzer(38) + ';' + fuzzer(3));
    t.true(newline.hasCompleteMessage());

    const longer = new MessageQueue(' | ');
    t.false(longer.hasCompleteMessage());
    longer.push(fuzzer(38) + ' | ' + fuzzer(3));
    t.true(longer.hasCompleteMessage());
});

test('[MessageQueue] : test message retrieval', t => {
    const fuzzer = fuzzy(alphanumerical);

    const message = fuzzy(alphanumerical)(30) + ';'

    const queue = new MessageQueue(';');
    queue.push(message);
    queue.push(fuzzy(alphanumerical.concat([';']))(1028));
    t.is(queue.pop(), message);
});

test('[MessageQueue] : test iterator', t => {
    const fuzzer = fuzzy(alphanumerical);
    const queue = new MessageQueue(';');
    queue.push(fuzzer(16) + ';' + fuzzer(16) + ';' + fuzzer(16) + ';' + fuzzer(16));

    let count = 0;
    for (const message of queue) {
        count++;
        t.true(message.includes(';'));
        t.is(message.length, 17);
    }
    t.true(count === 3);
});

test('[MessageQueue] : fuzz iterator', t => {
    const EOM = ';'
    const fuzzer = fuzzy(alphanumerical.concat([EOM]));

    for (let i = 0; i < 4096; i++) {
        const input = fuzzer(2048);
        const count = (input.match(new RegExp(`${EOM}`, 'g')) || []).length;

        const queue = new MessageQueue(EOM);
        queue.push(input);
        t.is([...queue].length, count);
    }
});


const fuzzy = (characters: string[]): (n: number) => string => {
    const options = characters.length;
    return (length: number) => {
        let result = '';
        for (let counter = 0; counter < length; counter++) {
            result += characters[Math.floor(Math.random() * options)];
        }
        return result;
    };
}
import {ContinueFor} from "../../src/protocol/vendor/debug";
import {DebugFrameDecoder, encodeFrame} from "../../src/protocol/frame";

test("[debug protocol] encodes WARDuino CONTINUE_FOR fixture", t => {
    const payload = ContinueFor.encode({count: 5}).finish();
    const frame = encodeFrame({type: Command.COMMAND_CONTINUE_FOR, payload});
    t.deepEqual(frame, Buffer.from([0x16, 0x02, 0x08, 0x05]));
});

test("[debug protocol] decodes fragmented WARDuino frames", t => {
    const decoder = new DebugFrameDecoder();
    t.deepEqual(decoder.push(Buffer.from([0x16, 0x02])), []);
    t.deepEqual(decoder.push(Buffer.from([0x08, 0x05])), [{
        type: Command.COMMAND_CONTINUE_FOR,
        payload: Buffer.from([0x08, 0x05])
    }]);
});


test("[Message updates] encode function and local payloads", t => {
    const mapping = new SourceMap.Mapping();
    const functionRequest = Message.updateFunction({functionIndex: 3, instructions: Buffer.from([0xaa, 0xbb])});
    const localRequest = Message.updateLocal(2, {i32Bits: 5, index: 0});

    t.is(functionRequest.type, Command.COMMAND_UPDATE_FUNCTION);
    t.deepEqual(functionRequest.payload!(mapping), new Uint8Array([0x08, 0x03, 0x22, 0x02, 0xaa, 0xbb]));
    t.deepEqual(FunctionMessage.decode(functionRequest.payload!(mapping)), {functionIndex: 3, instructions: Buffer.from([0xaa, 0xbb]), range: undefined, locals: undefined});
    t.is(localRequest.type, Command.COMMAND_UPDATE_LOCAL);
    t.deepEqual(localRequest.payload!(mapping), new Uint8Array([0x08, 0x02, 0x12, 0x05, 0x0d, 0x05, 0x00, 0x00, 0x00]));
    t.deepEqual(ValueUpdate.decode(localRequest.payload!(mapping)), {index: 2, value: {i32Bits: 5, index: 0, i64Bits: undefined, f32Bits: undefined, f64Bits: undefined, raw: undefined}});
    t.throws(() => Message.updateLocal(-1, {i32Bits: 1, index: 0}), {message: /non-negative integer/});
});

test("[Message events] distinguish a range from the all-events default", t => {
    const mapping = new SourceMap.Mapping();
    t.deepEqual(Message.dumpEvents({start: 2, end: 9}).payload!(mapping), new Uint8Array([0x08, 0x02, 0x10, 0x09]));
    t.deepEqual(Range.decode(Message.dumpEvents({start: 2, end: 9}).payload!(mapping)), {start: 2, end: 9});
    t.deepEqual(Message.dumpAllEvents.payload!(mapping), new Uint8Array());
});
