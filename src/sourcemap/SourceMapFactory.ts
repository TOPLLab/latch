import {getFileExtension} from '../util/util';
import {CompileOutput, CompilerFactory, CompilerOptions} from '../manage/Compiler';
import {AsScriptMapper, WatMapper} from './SourceMapper';
import {WABT} from '../util/env';
import {SourceMap} from './SourceMap';
import * as path from 'path';

export class SourceMapFactory {

    private readonly compilerFactory: CompilerFactory;

    constructor() {
        this.compilerFactory = new CompilerFactory(WABT);
    }

    public async map(source: string, compilerOptions?: CompilerOptions, tmpdir?: string): Promise<SourceMap.Mapping> {
        let compiled: CompileOutput;
        switch (getFileExtension(source)) {
            case 'wast' :
            case 'wat' :
                compiled = await this.compilerFactory.pickCompiler(source).compile(source, compilerOptions);
                return new WatMapper(compiled.out ?? '', tmpdir ?? path.dirname(compiled.file), WABT).mapping();
            case 'ts' :
                return new AsScriptMapper(source ?? '', tmpdir ?? path.dirname(source)).mapping();
        }
        throw new Error('Unsupported file type');
    }
}
