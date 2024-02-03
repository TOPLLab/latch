import {Expectation, Expected, Instruction, Kind, Step} from './Step';
import {WASM} from '../../sourcemap/Wasm';
import {Exception, Message} from '../../messaging/Message';
import Value = WASM.Value;

export class Invoker implements Step {
    readonly title: string;
    readonly instruction: Instruction;
    readonly expected?: Expectation[];

    constructor(func: string, args: Value[], result: Value) {
        this.title = `ASSERT: ${func} ${args.map(val => val.value).join(' ')} ${result.value}`;
        this.instruction = invoke(func, args);
        this.expected = returns(result);
    }
}

export function invoke(func: string, args: Value[]): Instruction {
    return {kind: Kind.Request, value: Message.invoke(func, args)};
}

export function returns(n: Value): Expectation[] {
    return [{'value': {kind: 'primitive', value: n.value} as Expected<number>}]
}
