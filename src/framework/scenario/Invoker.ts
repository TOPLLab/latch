import {Expectation, Expected, Instruction, Kind, Step} from './Step';
import {WASM} from '../../sourcemap/Wasm';
import {Exception, Message} from '../../messaging/Message';
import Value = WASM.Value;

export class Invoker implements Step {
    readonly title: string;
    readonly instruction: Instruction;
    readonly expected?: Expectation[];

    constructor(func: string, args: Value[], result: number) {
        this.title = `ASSERT: ${func} ${args.map(val => val.value).join(' ')} ${result}`;
        this.instruction = {kind: Kind.Request, value: Message.invoke(func, args)}
        this.expected = [{'value': {kind: 'primitive', value: result} as Expected<number>}];
    }
}