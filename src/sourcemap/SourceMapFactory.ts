import {getFileExtension} from '../util/util';
import {CompileOutput, CompilerFactory} from '../manage/Compiler';
import {AsScriptMapper, WatMapper} from './SourceMapper';
import {WABT} from '../util/env';
import {SourceMap} from './SourceMap';
import * as path from 'path';

export class SourceMapFactory {

    private readonly compilerFactory: CompilerFactory;

    constructor() {
        this.compilerFactory = new CompilerFactory(WABT);
    }

    public async map(source: string, tmpdir?: string): Promise<SourceMap.Mapping> {
        let compiled: CompileOutput;
        switch (getFileExtension(source)) {
            case 'wast' :
            case 'wat' :
                compiled = await this.compilerFactory.pickCompiler(source).compile(source);
                return new WatMapper(compiled.out ?? '', tmpdir ?? path.dirname(compiled.file), WABT).mapping();
            case 'wasm' :
                // Precompiled modules do not carry a WAT source mapping. The
                // module can still be executed; requests that need source
                // locations simply have no mapping to resolve against.
                return new SourceMap.Mapping();
            case 'ts' :
                return new AsScriptMapper(source ?? '', tmpdir ?? path.dirname(source)).mapping();
        }
        throw new Error('Unsupported file type');
    }
}
