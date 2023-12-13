import {Expectation, Expected, Instruction, Kind, Step} from './Step';
import {WASM} from '../sourcemap/Wasm';
import {Exception, Message} from '../parse/Requests';
import {WARDuino} from '../debug/WARDuino';
import {SourceMap} from '../sourcemap/SourceMap';
import Value = WASM.Value;

export class Invoker implements Step {
    readonly title: string;
    readonly instruction: Instruction<WARDuino.State | Exception>;
    readonly expected?: Expectation[];

    constructor(func: string, args: Value[], result: number) {
        this.title = `assert: ${func} ${args.map(val => val.value).join(' ')} ${result}`;
        this.instruction = {kind: Kind.Request, value: Message.invoke(func, args)}
        this.expected = [{'value': {kind: 'primitive', value: result} as Expected<number>}];
    }
}