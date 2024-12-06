import {SourceMap} from './SourceMap';
import {exec, ExecException} from 'child_process';
import * as fs from 'fs';
import {MappingItem, SourceMapConsumer} from 'source-map';
import SourceLine = SourceMap.SourceLine;
import Mapping = SourceMap.Mapping;
import Closure = SourceMap.Closure;
import Variable = SourceMap.Variable;
import TargetInstruction = SourceMap.TargetInstruction;
import {find} from '../util/util';

export abstract class SourceMapper {
    abstract mapping(): Promise<Mapping>;
}

// Maps Wasm to WAT
export class WatMapper implements SourceMapper {
    private readonly tmpdir: string;
    private readonly wabt: string;

    private lineMapping: SourceMap.SourceLine[];

    constructor(compileOutput: string, tmpdir: string, wabt: string) {
        this.lineMapping = [];
        this.parse(compileOutput);
        this.wabt = wabt;
        this.tmpdir = tmpdir;
    }

    public mapping(): Promise<Mapping> {
        return new Promise<Mapping>((resolve, reject) => {
            let functions: Closure[];
            let globals: Variable[];
            let imports: Closure[];
            let sourceMap: Mapping;

            function handleObjDumpStreams(error: ExecException | null, stdout: string, stderr: any) {
                if (stderr.match('wasm-objdump')) {
                    reject('Could not find wasm-objdump in the path');
                } else if (error) {
                    reject(error.message);
                }

                try {
                    functions = WatMapper.getFunctionInfos(stdout);
                    globals = WatMapper.getGlobalInfos(stdout);
                    imports = WatMapper.getImportInfos(stdout);
                } catch (e) {
                    reject(e);
                }
            }

            const objDump = exec(this.getNameDumpCommand(), handleObjDumpStreams);

            sourceMap = new SourceMap.Mapping().init(this.lineMapping, [], [], []);
            objDump.on('close', () => {
                sourceMap.functions = functions;
                sourceMap.globals = globals;
                sourceMap.imports = imports;
                resolve(sourceMap);
            });
        });
    }

    private parse(compileOutput: string) {
        this.lineMapping = [];
        const lines = compileOutput.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/^@ {/)) {
                const mapping: SourceLine = WatMapper.extractLineInfo(lines[i]);
                mapping.instructions = WatMapper.extractAddressInfo(lines[i + 1]);
                this.lineMapping.push(mapping);
            }
        }
    }

    private static extractLineInfo(line: string): SourceLine {
        const obj = JSON.parse(line.substring(2));
        return {line: obj.line, columnStart: obj.col_start - 1, columnEnd: obj.col_end, instructions: []};
    }

    private static extractAddressInfo(line?: string): TargetInstruction[] {
        if (line === undefined) {
            return [];
        }

        const regexpr = /^(?<address>([\da-f])+):/;
        const match = line.match(regexpr);
        if (match?.groups) {
            return [{address: parseInt(match.groups.address, 16)}];
        }

        throw Error(`Could not parse address from line: ${line}`);
    }

    private static getFunctionInfos(input: string): Closure[] {
        const functionLines: string[] = extractMajorSection('Function', input);

        if (functionLines.length === 0) {
            throw Error('Could not messaging \'sourcemap\' section of objdump');
        }
        const functions: Closure[] = [];

        functionLines.forEach((line: string) => {
            const fidx: number = +find(/func\[([0-9]+)/, line.toString());
            const name: string = find(/<(.*)>/, line.toString());

            const locals: Variable[] = [];
            const matches: string[] = input.match(new RegExp(`(func\[${fidx}\][^\n]*)`, 'g')) ?? [];
            for (const text in matches) {
                const index: number = +find(/func\[([0-9]+)/, line.toString());
                const local: string = find(/<(.*)>/, line.toString());
                locals.push({index: index, name: local, type: 'undefined', mutable: true, value: ''});
            }

            functions.push({index: fidx, name: name, arguments: [], locals: locals});
        })

        return functions;
    }

    private static getGlobalInfos(input: string): Variable[] {
        const lines: string[] = extractDetailedSection('Global[', input);
        const globals: Variable[] = [];
        lines.forEach((line) => {
            globals.push(extractGlobalInfo(line));
        });
        return globals;
    }

    private static getImportInfos(input: string): Closure[] {
        const lines: string[] = extractDetailedSection('Import[', input);
        const globals: Closure[] = [];
        lines.forEach((line) => {
            globals.push(extractImportInfo(line));
        });
        return globals;
    }

    private getNameDumpCommand(): string {
        return `${this.wabt}/wasm-objdump -x -m ${this.tmpdir}/upload.wasm`;
    }
}

function extractDetailedSection(section: string, input: string): string[] {
    const lines = input.split('\n');
    let i = 0;
    while (i < lines.length && !lines[i].startsWith(section)) {
        i++;
    }

    if (i >= lines.length) {
        return [];
    }

    const count: number = +(lines[i++].split(/[\[\]]+/)[1]);
    return lines.slice(i, ((isNaN(count)) ? lines.length : i + count));
}

function extractMajorSection(section: string, input: string): string[] {
    const lines = input.split('\n');
    let i = 0;
    while (i < lines.length && !lines[i].startsWith(section)) {
        i++;
    }

    i += 2;
    const start = i;
    while (i < lines.length && lines[i] !== '') {
        i++;
    }

    const count: number = +(lines[i++].split(/[[]+/)[1]);
    return lines.slice(start, i);
}

function extractGlobalInfo(line: string): Variable {
    const global = {} as Variable;
    let match = line.match(/\[([0-9]+)]/);
    global.index = (match === null) ? NaN : +match[1];
    match = line.match(/ ([if][0-9][0-9]) /);
    global.type = (match === null) ? 'undefined' : match[1];
    match = line.match(/<([a-zA-Z0-9 ._]+)>/);
    global.name = ((match === null) ? `${global.index}` : `$${match[1]}`) + ` (${global.type})`;
    match = line.match(/mutable=([0-9])/);
    global.mutable = match !== null && +match[1] === 1;
    match = line.match(/init.*=(.*)/);
    global.value = (match === null) ? '' : match[1];
    return global;
}

function extractImportInfo(line: string): Closure {
    const primitive = {} as Closure;
    let match = line.match(/\[([0-9]+)]/);
    primitive.index = (match === null) ? NaN : +match[1];
    match = line.match(/<([a-zA-Z0-9 ._]+)>/);
    primitive.name = ((match === null) ? `${primitive.index}` : `$${match[1]}`);
    return primitive;
}

// Maps Wasm to AS
export class AsScriptMapper implements SourceMapper {
    private readonly sourceFile: string;
    private readonly tmpdir: string;

    constructor(sourceFile: string, tmpdir: string) {
        this.sourceFile = sourceFile;
        this.tmpdir = tmpdir;
    }

    public mapping(): Promise<Mapping> {
        const input = fs.readFileSync(`${this.tmpdir}/upload.wasm.map`)

        return new Promise((resolve, reject) => {
            new SourceMapConsumer(input.toString()).then((consumer: SourceMapConsumer) => {
                const mapping: Mapping = new SourceMap.Mapping().init([], [], [], []);
                consumer.eachMapping(function (item: MappingItem) {
                    mapping.lines.push({
                        line: item.originalLine,
                        columnStart: item.originalColumn,
                        instructions: [{
                            address: item.generatedColumn
                        }],
                        source: item.source
                    })
                });
                resolve(mapping);
            });
        });
    }
}