import {WASM} from '../sourcemap/Wasm';
import * as ieee754 from 'ieee754';
import {Ack, Exception} from './Message';
import {Breakpoint} from '../debug/Breakpoint';
import {WARDuino} from '../debug/WARDuino';
import {JSONParse} from 'json-with-bigint';
import State = WARDuino.State;
import nothing = WASM.nothing;
import Type = WASM.Type;
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
    const stack: {value: any, type: any}[] = stateParser(text).stack!;
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

function extractType(object: {value: bigint | number, type: any}): Type {
    if (isNaN(<number>object.value)) return WASM.Special.nan;
    if (<number>object.value === Infinity) return WASM.Special.infinity;
    return WASM.typing.get(object.type.toLowerCase()) ?? WASM.Special.unknown;
}

function stacking(objects: {value: bigint | number, type: any}[]): WASM.Value<Type>[] {
    const stacked: WASM.Value<Type>[] = [];
    for (const object of objects) {
        const type: WASM.Type = extractType(object);
        let buff;
        switch (type) {
            case WASM.Special.nan:
                stacked.push({value: NaN, type: type});
                break;
            case WASM.Special.infinity:
                stacked.push({value: Infinity, type: type});
                break;
            case WASM.Integer.u32:
            case WASM.Integer.u64:
                stacked.push({value: object.value, type: type});
                break;
            case WASM.Integer.i32:
                stacked.push({value: signed(BigInt(object.value), 32), type: type});
                break;
            case WASM.Integer.i64:
                stacked.push({value: signed(BigInt(object.value), 64), type: type});
                break;
            case WASM.Float.f32:
                buff = Buffer.from(Number(object.value.toString(16)).toString(16), 'hex');
                stacked.push({value: ieee754.read(buff, 0, false, 23, buff.length), type: type});
                break;
            case WASM.Float.f64:
                buff = Buffer.from(BigInt(object.value.toString(16)).toString(16), 'hex');
                stacked.push({value: ieee754.read(buff, 0, false, 52, buff.length), type: type});
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