export namespace WASM {
    export enum Float {
        f32 = 'f32',
        f64 = 'f64'
    }

    export enum Integer {
        u32 = 'u32',
        i32 = 'i32',
        u64 = 'u64',
        i64 = 'i64'
    }

    export enum Special {
        nothing = 'nothing',
        nan = 'nan',
        infinity = 'infinity',
        unknown = 'unknown'
    }

    export type Type = Float | Integer | Special;

    export const typing = new Map<string, Type>([
        ['f32', Float.f32],
        ['f64', Float.f64],
        ['u32', Integer.u32],
        ['i32', Integer.i32],
        ['u64', Integer.u64],
        ['i64', Integer.i64]
    ]);

    export interface Value<T extends Type>   {
        type: T;
        value: T extends Integer ? bigint : number;
    }

    export function equals<T extends Type>(a: Value<T>, b: Value<T>): boolean {
        switch (a.type) {
            case Special.nan:
                return b.type === Special.nan;
            case Special.infinity:
                return b.type === Special.infinity;
            case Special.nothing:
                return b.type === Special.nothing;
            case Special.unknown:
                return b.type === Special.unknown;
            default:
                return a.type === b.type && a.value === b.value;
        }
    }

    export interface Nothing extends Value<Special> {}

    export const nothing: Nothing = {
        type: Special.nothing, value: 0
    }

    export function u32(n: bigint): WASM.Value<Integer> {
        return {value: n, type: Integer.u32};
    }

    export function i32(n: bigint): WASM.Value<Integer> {
        return {value: n, type: Integer.i32};
    }

    export function f32(n: number): WASM.Value<Float> {
        return {value: n, type: Float.f32};
    }

    export function f64(n: number): WASM.Value<Float> {
        return {value: n, type: Float.f64};
    }

    export function u64(n: bigint): WASM.Value<Integer> {
        return {value: n, type: Integer.u64};
    }

    export function i64(n: bigint): WASM.Value<Integer> {
        return {value: n, type: Integer.i64};
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

    export function leb128(value: bigint | number): string { // TODO can only handle 32 bit
        let a = Number(value);
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

}