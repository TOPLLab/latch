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

    export class WasmInt {
        private constructor(
            private readonly kind: 'finite' | 'inf' | 'nan',
            private readonly finiteValue?: bigint,
            private readonly positive: boolean = true
        ) {
        }

        static finite(value: bigint): WasmInt {
            return new WasmInt('finite', value, value >= 0);
        }

        static infinity(positive: boolean = true): WasmInt {
            return new WasmInt('inf', undefined, positive);
        }

        static nan(positive: boolean = true): WasmInt {
            return new WasmInt('nan', undefined, positive);
        }

        isFinite(): boolean {
            return this.kind === 'finite';
        }

        isInfinity(): boolean {
            return this.kind === 'inf';
        }

        isNaN(): boolean {
            return this.kind === 'nan';
        }

        toBigInt(): bigint {
            if (this.finiteValue !== undefined) {
                return this.finiteValue;
            }
            throw new Error(`Cannot convert ${this.toString()} to bigint.`);
        }

        toNumber(): number {
            switch (this.kind) {
                case 'finite':
                    return Number(this.finiteValue!);
                case 'inf':
                    return this.positive ? Infinity : -Infinity;
                case 'nan':
                    return this.positive ? NaN : -NaN;
            }
        }

        equals(other: WasmInt): boolean {
            return this.kind === 'finite'
                ? this.finiteValue === other.finiteValue
                : this.kind === other.kind && this.positive === other.positive;
        }

        toString(): string {
            if (this.kind === 'finite') {
                return this.finiteValue!.toString();
            }
            return `${this.positive ? '' : '-'}${this.kind}`;
        }
    }


    export interface Value<T extends Type> {
        type: T;
        value: T extends Integer ? WasmInt : number;
    }

    export function equals<T extends Type>(a: Value<T>, b: Value<T>): boolean {
        switch (a.type) {
            case Special.nothing:
                return b.type === Special.nothing;
            case Special.unknown:
                return b.type === Special.unknown;
            default:
                return a.type === b.type && a.value === b.value;
        }
    }

    export interface Nothing extends Value<Special> {
    }

    export const nothing: Nothing = {
        type: Special.nothing, value: 0
    }

    export function isInteger(type: Type): type is Integer {
        return type === Integer.u32 || type === Integer.i32 || type === Integer.u64 || type === Integer.i64;
    }

    export function isFloat(type: Type): type is Float {
        return type === Float.f32 || type === Float.f64;
    }

    export function nan(type: WASM.Type, positive: boolean = true): WASM.Value<Type> {
        return {value: isInteger(type) ? WasmInt.nan(positive): (positive ? NaN : -NaN), type};
    }

    export function inf(type: WASM.Type, positive: boolean = true): WASM.Value<Type> {
        return {value: isInteger(type) ? WasmInt.infinity(positive): (positive ? Infinity : -Infinity), type};
    }

    export function u32(n: bigint): WASM.Value<Integer> {
        return {value: WasmInt.finite(n), type: Integer.u32};
    }

    export function i32(n: bigint): WASM.Value<Integer> {
        return {value: WasmInt.finite(n), type: Integer.i32};
    }

    export function f32(n: number): WASM.Value<Type> {
        return {value: n, type: Float.f32};
    }

    export function f64(n: number): WASM.Value<Type> {
        return {value: n, type: Float.f64};
    }

    export function u64(n: bigint): WASM.Value<Integer> {
        return {value: WasmInt.finite(n), type: Integer.u64};
    }

    export function i64(n: bigint): WASM.Value<Integer> {
        return {value: WasmInt.finite(n), type: Integer.i64};
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

}
