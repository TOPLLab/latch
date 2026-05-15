import {Expectation, Expected, Instruction, Kind, Step} from './Step';
import {WASM} from '../../sourcemap/Wasm';
import {Message} from '../../messaging/Message';
import {Target} from '../Testee';
import Value = WASM.Value;
import Type = WASM.Type;

export class Invoker implements Step {
    readonly title: string;
    readonly instruction: Instruction;
    readonly expected?: Expectation[];
    readonly target?: Target;

    constructor(func: string, args: Value<Type>[], result: Value<Type>, target?: Target) {
        let prefix = '';
        this.instruction = invoke(func, args);
        this.expected = returns(result);
        if (target !== undefined) {
            this.target = target;
            prefix = `${target === Target.supervisor ? '[supervisor] ' : '[proxy]      '}`
        }
        this.title = `${prefix}CHECK: (${func} ${args.map(val => val.value).join(' ')}) returns ${result?.value ?? 'nothing'}`;
    }
}

export function invoke(func: string, args: Value<Type>[]): Instruction {
    return {kind: Kind.Request, value: Message.invoke(func, args)};
}

export function returns(n: Value<Type>): Expectation[] {
    return [{'value': {kind: 'primitive', value: n.value} as Expected<WASM.Type>}]
}
