import {Expectation, Expected, Instruction, Kind, Step} from './Step';
import {WASM} from '../../sourcemap/Wasm';
import {Message} from '../../messaging/Message';
import {Target} from '../Testee';
import Value = WASM.Value;

export class Invoker implements Step {
    readonly title: string;
    readonly instruction: Instruction;
    readonly expected?: Expectation[];
    readonly target?: Target;

    constructor(func: string, args: Value[], result: Value, target?: Target) {
        let prefix = "";
        this.instruction = invoke(func, args);
        this.expected = returns(result);
        if (target !== undefined) {
            this.target = target;
            prefix = `${target === Target.supervisor ? '[supervisor] ' : '[proxy]      '}`
        }
        this.title = `${prefix}CHECK: (${func} ${args.map(val => val.value).join(' ')}) returns ${result.value}`;
    }
}

export function invoke(func: string, args: Value[]): Instruction {
    return {kind: Kind.Request, value: Message.invoke(func, args)};
}

export function returns(n: Value): Expectation[] {
    return [{'value': {kind: 'primitive', value: n.value} as Expected<number>}]
}
