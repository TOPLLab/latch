import test from 'ava';
import {WASM} from '../../src/sourcemap/Wasm';
import {WatMapper} from '../../src/sourcemap/SourceMapper';
import {SourceMap} from '../../src/sourcemap/SourceMap';
import {WABT} from '../../src/util/env';
import {copyFileSync, mkdtempSync, readFileSync, rmSync} from 'fs';

import * as leb from '@thi.ng/leb128';

const artifacts = `${__dirname}/../../../tests/artifacts`;

/**
 * Check LEB 128 encoding
 */
test('[leb128] : test encode positive numbers', t => {
    t.is(WASM.leb128(BigInt(0)), '00');
    t.is(WASM.leb128(BigInt(1)), '01');
    t.is(WASM.leb128(BigInt(8)), '08');
    t.is(WASM.leb128(BigInt(32)), '20');
    t.is(WASM.leb128(BigInt(64)), 'C000');
    t.is(WASM.leb128(BigInt(127)), 'FF00');
    t.is(WASM.leb128(BigInt(128)), '8001');
    t.is(WASM.leb128(BigInt(1202)), 'B209');
    t.is(WASM.leb128(BigInt(2147483647)), 'FFFFFFFF07');
    t.is(WASM.leb128(BigInt(4294967295)), 'FFFFFFFF0F');
    t.is(WASM.leb128(Number.MAX_SAFE_INTEGER), 'FFFFFFFFFFFFFF0F');
});

test('[leb128] : test encode negative numbers', t => {
    t.is(WASM.leb128(BigInt(-1)), '7F');
    t.is(WASM.leb128(BigInt(-8)), '78');
    t.is(WASM.leb128(BigInt(-32)), '60');
    t.is(WASM.leb128(BigInt(-64)), '40');
    t.is(WASM.leb128(BigInt(-127)), '817F');
    t.is(WASM.leb128(BigInt(-128)), '807F');
});

test('[extractLineInfo] : test against artifacts (1)', async t => {
    await check(`${artifacts}/compile.output`, (mapping: SourceMap.Mapping) => {
        // check line information
        t.true(mapping.lines.some((entry) =>
            entry.line === 13 &&
            // entry.columnStart === 21 &&
            entry.columnEnd === 30 &&
            entry.instructions.some((entry) =>
                entry.address === 114)));

        t.true(mapping.lines.some((entry) =>
            entry.line === 22 &&
            // entry.columnStart === 5 &&
            entry.columnEnd === 9 &&
            entry.instructions.some((entry) =>
                entry.address === 158)));
    });
})
;

test('[extractImportInfo] : test against artifacts (1)', async t => {
    await check(`${artifacts}/compile.output`, (mapping: SourceMap.Mapping) => {
        // check imports
        t.true(mapping.imports.some((entry) => entry.name.includes('chip_delay') && entry.index === 0));
        t.true(mapping.imports.some((entry) => entry.name.includes('chip_pin_mod') && entry.index === 1));
        t.true(mapping.imports.some((entry) => entry.name.includes('chip_digital') && entry.index === 2));
    });
});

test('[extractGlobalInfo] : test against artifacts (1)', async t => {
    await check(`${artifacts}/compile.output`, (mapping: SourceMap.Mapping) => {
        // check globals
        t.true(mapping.globals.some((entry) => entry.name.includes('led') && entry.index === 0));
        t.true(mapping.globals.some((entry) => entry.name.includes('on') && entry.index === 1));
        t.true(mapping.globals.some((entry) => entry.name.includes('off') && entry.index === 2));
    });
});

test('[getFunctionInfos] : test against artifacts (1)', async t => {
    await check(`${artifacts}/compile.output`, (mapping: SourceMap.Mapping) => {
        // check functions
        t.true(mapping.functions.some((entry) => entry.name.includes('blink') && entry.index === 4));
    });
});

// run a set of _checks_ against the source mapping for a given _filename_
async function check(filename: string, checks: (mapping: SourceMap.Mapping) => void) {
    const dummy = readFileSync(filename).toString();
    const path = initialize();
    const mapper: WatMapper = new WatMapper(dummy, path, WABT);
    const mapping: SourceMap.Mapping = await mapper.mapping();

    checks(mapping);

    rmSync(path, {recursive: true});
}

function initialize(): string {
    const tmp: string = mkdtempSync('test');
    copyFileSync(`${artifacts}/upload.wasm`, `${tmp}/upload.wasm`);
    return tmp;
}