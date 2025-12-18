import * as leb from "@thi.ng/leb128";

export namespace WASM {

    export enum Float {
        f32,
        f64,
    }

    export enum Integer {
        i32,
        i64,
    }

    export enum Special {
        nothing,
        unknown
    }

    export type Type = Float | Integer | Special;


    export const typing = new Map<string, Type>([
        ['f32', Float.f32],
        ['f64', Float.f64],
        ['i32', Integer.i32],
        ['i64', Integer.i64]
    ]);

    export interface Value<T extends Type> {
        type: T;
        value: T extends Float ? number : bigint;
    }

    export type Nothing = Value<Type>

    export const nothing: Nothing = {
        type: Special.nothing, value: 0
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

    export const leb128 = (v: number | bigint) => Buffer.from(leb.encodeSLEB128(v)).toString('hex').toUpperCase().padStart(2, '0')
}