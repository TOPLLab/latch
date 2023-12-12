import {Expectation, Expected, Step} from "./Step";
import {Action, Instruction} from "./Actions";
import {WASM} from "../sourcemap/Wasm";
import Value = WASM.Value;

export class Invoker implements Step {
    readonly instruction: Instruction | Action = Instruction.invoke;
    readonly title: string;
    readonly payload?: any;
    readonly expectResponse: boolean = true;
    readonly expected?: Expectation[];

    constructor(func: string, args: Value[], result: number) {
        this.title = `assert: ${func} ${args.map(val => val.value).join(' ')} ${result}`;
        this.payload = {name: func, args: args};
        this.expected = [{'value': {kind: 'primitive', value: result} as Expected<number>}];
    }
}