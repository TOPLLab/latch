export namespace WASM {
    export enum Type {
        f32,
        f64,
        i32,
        i64,
        v128,
        nothing,
        unknown
    }

    export const typing = new Map<string, Type>([
        ['f32', Type.f32],
        ['f64', Type.f64],
        ['i32', Type.i32],
        ['i64', Type.i64],
        ['v128', Type.v128]
    ]);

    export interface Value {
        type: Type;
        value: number|bigint|string;
    }

    export interface Nothing extends Value {}

    export const nothing: Nothing = {
        type: Type.nothing, value: 0
    }

    export function i32(n: bigint|number): WASM.Value {
        return {value: n, type: Type.i32};
    }

    export function f32(n: number): WASM.Value {
        return {value: n, type: Type.f32};
    }

    export function v128(bytes: string): WASM.Value {
        return {value: bytes, type: Type.v128};
    }

    export interface Frame {
        type: number;
        fidx: string;
        sp: number;
        fp: number;
        block_key: number;
        ra: number;
        idx: number;
    }

    export interface Table {
        max: number;
        init: number;
        elements: number[];
    }

    export interface Memory {
        pages: number;
        max: number;
        init: number;
        bytes: Uint8Array;
    }

    export function leb128(a: number): string { // TODO can only handle 32 bit
        a |= 0;
        const result = [];
        while (true) {
            const byte_ = a & 0x7f;
            a >>= 7;
            if (
                (a === 0 && (byte_ & 0x40) === 0) ||
                (a === -1 && (byte_ & 0x40) !== 0)
            ) {
                result.push(byte_.toString(16).padStart(2, '0'));
                return result.join('').toUpperCase();
            }
            result.push((byte_ | 0x80).toString(16).padStart(2, '0'));
        }
    }

    export function leb128_bigint(value: bigint, n_bits: number): string {
        const result: number[] = [];
        let more = true;

        while (more) {
            let byte = Number(value & BigInt(0x7F)); // Get the lower 7 bits
            const signBit = byte & 0x40; // Check if the sign bit is set
            value >>= BigInt(7); // Arithmetic shift right by 7 bits

            // Determine if we need to continue encoding
            if ((value === BigInt(0) && signBit === 0) || (value === BigInt(-1) && signBit !== 0)) {
                more = false;
            } else {
                byte |= 0x80; // Set the continuation bit
            }
            result.push(byte);
        }

        return result.map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    }
}