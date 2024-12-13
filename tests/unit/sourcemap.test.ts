import test from 'ava';
import {WASM} from '../../src/sourcemap/Wasm';
import {WatMapper} from '../../src/sourcemap/SourceMapper';
import {SourceMap} from '../../src/sourcemap/SourceMap';
import {WABT} from '../../src/util/env';
import {mkdtempSync, readFileSync, copyFileSync} from 'fs';

const artifacts = `${__dirname}/../../../tests/artifacts`;

test('test wasm/leb128', t => {
    t.is(WASM.leb128(0), '00');
    t.is(WASM.leb128(1), '01');
    t.is(WASM.leb128(8), '08');
    t.is(WASM.leb128(32), '20');
    // t.is(WASM.leb128(64), '40');
    t.is(WASM.leb128(128), '8001');
    // t.is(WASM.leb128(1202), 'b209');
});

function initialize(): string {
    const tmp: string = mkdtempSync('');
    copyFileSync(`${artifacts}/upload.wasm`, `${tmp}/upload.wasm`);
    return tmp;
}

test('test WatMapper/extractLineInfo', async t => {
    const dummy = readFileSync(`${artifacts}/compile.output`).toString();
    const mapper: WatMapper = new WatMapper(dummy, initialize(), WABT);
    const mapping: SourceMap.Mapping = await mapper.mapping();
    t.true(mapping.lines.length > 0);
});
