import {WASM} from '../sourcemap/Wasm';
import * as ieee754 from 'ieee754';
import {Ack, Exception} from './Message';
import {Breakpoint} from '../debug/Breakpoint';
import {WARDuino} from '../debug/WARDuino';
import State = WARDuino.State;

export function identityParser(text: string) {
    return stripEnd(text);
}

export function stateParser(text: string): State {
    return JSON.parse(text);
}

export function invokeParser(text: string): WASM.Value | Exception {
    if (exception(text)) {
        return {text: text};
    }
    const stack: {value: any, type: any}[] = stateParser(text).stack!;
    return stacking(stack)[stack.length - 1];
}

function exception(text: string): boolean {
    return text.trim()[0] !== '{' && !text.trim().includes('Interrupt');
}

export function ackParser(text: string, ack: string): Ack {
    if (text.toLowerCase().includes(ack.toLowerCase())) {
        return {'text': identityParser(text)};
    }
    throw Error(`No ack for ${ack}.`);
}

export function breakpointParser(text: string): Breakpoint {
    const ack: Ack = ackParser(text, 'BP');

    let breakpointInfo = ack.text.match(/BP (0x.*)!/);
    if (breakpointInfo!.length > 1) {
        return new Breakpoint(parseInt(breakpointInfo![1]), 0); // TODO address to line mapping
    }

    throw new Error('Could not messaging BREAKPOINT address in ack.');
}

export function breakpointHitParser(text: string): Breakpoint {
    const ack: Ack = ackParser(text, 'AT ');

    let breakpointInfo = ack.text.match(/AT (0x.*)!/);
    if (breakpointInfo!.length > 1) {
        return new Breakpoint(parseInt(breakpointInfo![1]), 0); // TODO address to line mapping
    }

    throw new Error('Could not messaging BREAKPOINT address in ack.');
}

function stacking(objects: {value: any, type: any}[]): WASM.Value[] {
    const stacked: WASM.Value[] = [];
    for (const object of objects) {
        let value: number = object.value;
        const type: WASM.Type = WASM.typing.get(object.type.toLowerCase()) ?? WASM.Type.unknown;
        if (type === WASM.Type.f32 || type === WASM.Type.f64) {
            const buff = Buffer.from(object.value, 'hex');
            value = ieee754.read(buff, 0, false, 23, buff.length);
        }
        stacked.push({value: value, type: type});
    }
    return stacked;
}


// Strips all trailing newlines
function stripEnd(text: string): string {
    return text.replace(/\s+$/g, '');
}