import test from 'ava';
import {signed} from "../../src/messaging/Parsers";

/**
 * Check unsigned 32-bit integer to signed conversion
 */
test('[parser] : 32-bit unsigned to signed', t => {
    t.is(signed(0, 32), 0n);
    t.is(signed(4294967295, 32), -1n);
});

/**
 * Check unsigned 64-bit integer to signed conversion
 */
test('[parser] : 64-bit unsigned to signed', t => {
    t.is(signed(0, 64), 0n);
    t.is(signed(4294967295, 64), 4294967295n);
});