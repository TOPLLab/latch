import test from 'ava';
import {WASM} from '../../src/sourcemap/Wasm';

test('test wasm/leb128', t => {
    t.is(WASM.leb128(0), '00');
    t.is(WASM.leb128(1), '01');
    t.is(WASM.leb128(8), '08');
    t.is(WASM.leb128(32), '20');
    // t.is(WASM.leb128(64), '40');
    t.is(WASM.leb128(128), '8001');
    // t.is(WASM.leb128(1202), 'b209');
});