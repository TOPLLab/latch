import test from 'ava';
import {signed, stateParser} from "../../src/messaging/Parsers";
import {WARDuino} from "../../src";
import State = WARDuino.State;

/**
 * Check unsigned 32-bit integer to signed conversion
 */
test('[signed] : 32-bit unsigned to signed', t => {
    t.is(signed(0n, 32), 0n);
    t.is(signed(1n, 32), 1n);
    t.is(signed(127n, 32), 127n);
    t.is(signed(128n, 32), 128n);
    t.is(signed(2147483647n, 32), 2147483647n);
    t.is(signed(2147483648n, 32), -2147483648n);
    t.is(signed(4294967294n, 32), -2n);
    t.is(signed(4294967295n, 32), -1n);
});

/**
 * Check unsigned 64-bit integer to signed conversion
 */
test('[signed] : 64-bit unsigned to signed', t => {
    t.is(signed(0n, 64), 0n);
    t.is(signed(1n, 64), 1n);
    t.is(signed(127n, 64), 127n);
    t.is(signed(128n, 64), 128n);
    t.is(signed(2147483648n, 64), 2147483648n);
    t.is(signed(4294967295n, 64), 4294967295n);
    t.is(signed(18446744073709551615n, 64), -1n);
    t.is(signed(18446744073709551489n, 64), -127n);
});

/**
 * Check for precision loss in state parser
 */
const equality = (a: bigint | number | undefined, b: bigint) =>
    // false if a is undefined or a float
    (typeof a === 'bigint' && a === b) ||  // both bigint
    (a !== undefined && Number.isInteger(a) && BigInt(a) === b); // compare integer number with bigint

test('[state] : 32-bit integer precision', t => {
    const values: bigint[] = [1n, 127n, 2147483648n, 4294967294n];
    for (const value of values) {
        const state: State = stateParser(`{\"stack\": [{\"idx\":0,\"type\":\"i32\",\"value\":${value}}]}\n`);
        t.true(equality(state.stack?.[0].value, value));
    }
});

test('[state parser] : 64-bit integer precision', t => {
    const values: bigint[] = [1n, 127n, 2147483648n, 4294967294n, 18446744073709551615n, 18446744073709551489n];
    for (const value of values) {
        const state: State = stateParser(`{\"stack\": [{\"idx\":0,\"type\":\"i32\",\"value\":${value}}]}\n`);
        t.true(equality(state.stack?.[0].value, value));
    }
});