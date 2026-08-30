import test from 'ava';
import {MessageQueue} from '../../src/messaging/MessageQueue';
import {Message} from '../../src/messaging/Message';
import {WASM} from '../../src/sourcemap/Wasm';
import {SourceMap} from '../../src/sourcemap/SourceMap';
import {RemoteFunctionCall} from '../../src/protocol/vendor/debug';

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

test('[MessageQueue] : test EOM detection', t => {
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
import {Command, ContinueFor} from "../../src/protocol/vendor/debug";
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
