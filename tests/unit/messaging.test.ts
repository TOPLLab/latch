import test from 'ava';
import {MessageQueue} from '../../src/messaging/MessageQueue';

const alphanumerical = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');

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