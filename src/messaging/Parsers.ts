import {WASM} from '../sourcemap/Wasm';
import {Ack, Exception} from './Message';
import {Breakpoint} from '../debug/Breakpoint';
import {WARDuino} from '../debug/WARDuino';
import {JSONParse} from 'json-with-bigint';
import State = WARDuino.State;
import nothing = WASM.nothing;
import Type = WASM.Type;
import WasmInt = WASM.WasmInt;

export function identityParser(text: string) {
    return stripEnd(text);
}

export function stateParser(text: string): State {
    return JSONParse(text);
}

export function invokeParser(text: string): WASM.Value<Type> | Exception {
    if (exception(text)) {
        return {text: text};
    }
    const stack: { value: any, type: any }[] = stateParser(text).stack!;
    if (stack.length == 0) {
        return nothing;
    }
    return stacking(stack)[stack.length - 1];
}

function exception(text: string): boolean {
    return text.length > 1 && text.toLowerCase().includes('exception') && text.trim()[0] !== '{';
}

export function ackParser(text: string, ack: string): Ack {
    if (text.toLowerCase().includes(ack.toLowerCase())) {
        return {'text': identityParser(text)};
    }
    throw Error(`No ack for ${ack}.`);
}

export function breakpointParser(text: string): Breakpoint {
    const ack: Ack = ackParser(text, 'BP');

    const breakpointInfo = ack.text.match(/BP (0x.*)!/);
    if (breakpointInfo!.length > 1) {
        return new Breakpoint(parseInt(breakpointInfo![1]), 0); // TODO address to line mapping
    }

    throw new Error('Could not messaging BREAKPOINT address in ack.');
}

export function breakpointHitParser(text: string): Breakpoint {
    const ack: Ack = ackParser(text, 'AT ');

    const breakpointInfo = ack.text.match(/AT (0x.*)!/);
    if (breakpointInfo!.length > 1) {
        return new Breakpoint(parseInt(breakpointInfo![1]), 0); // TODO address to line mapping
    }

    throw new Error('Could not messaging BREAKPOINT address in ack.');
}

export function signed(value: bigint, bits = 32) {
    let x = value;
    const sign = 1n << BigInt(bits - 1);
    const mod = 1n << BigInt(bits);
    return x >= sign ? x - mod : x;

}

function extractType(object: { value: string, type: any }): Type {
    return WASM.typing.get(object.type.toLowerCase()) ?? WASM.Special.unknown;
}

function stacking(objects: { value: string, type: any }[]): WASM.Value<Type>[] {
    const stacked: WASM.Value<Type>[] = [];
    for (const object of objects) {
        const type: WASM.Type = extractType(object);
        switch (type) {
            case WASM.Integer.u32:
            case WASM.Integer.u64:
                stacked.push({
                    value: isNaN(Number(object.value)) ? WasmInt.nan()
                        : object.value === 'inf' ? WasmInt.infinity()
                            : object.value === '-inf' ? WasmInt.infinity(false)
                                : WasmInt.finite(BigInt(object.value)),
                    type: type
                });
                break;
            case WASM.Integer.i32:
                stacked.push({value: WasmInt.finite(signed(BigInt(object.value), 32)), type: type});
                break;
            case WASM.Integer.i64:
                stacked.push({value: WasmInt.finite(signed(BigInt(object.value), 64)), type: type});
                break;
            case WASM.Float.f32:
            case WASM.Float.f64:
                stacked.push({value: object.value === 'inf' ? Infinity : object.value === '-inf' ? -Infinity : Number(object.value), type: type});
                break;
            case WASM.Special.unknown:
                break;
        }
    }
    return stacked;
}


// Strips all trailing newlines
function stripEnd(text: string): string {
    return text.replace(/\s+$/g, '');
}