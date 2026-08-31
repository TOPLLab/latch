import {WASM} from '../sourcemap/Wasm';
import type {Exception} from './Message';
import nothing = WASM.nothing;
import Type = WASM.Type;
import WasmInt = WASM.WasmInt;
import {Command, OperationResult, RemoteFunctionResult, Value as ProtocolValue} from "../protocol/vendor/debug";

/** Decode and validate an operation response for one command. */
export function operationResultParser(expected: Command, payload: Uint8Array, decoded?: OperationResult): OperationResult {
    const result = decoded ?? OperationResult.decode(payload);
    if (result.command !== expected) {
        throw Error("Operation result was for command " + result.command + ", expected " + expected + ".");
    }
    if (!result.success) {
        throw Error("Operation " + (Command[expected] ?? expected) + " failed.");
    }
    return result;
}

/** Convert a protobuf remote-function response into the Latch WASM value contract. */
export function remoteFunctionResultParser(payload: Uint8Array): WASM.Value<Type> | Exception {
    return remoteFunctionResult(RemoteFunctionResult.decode(payload));
}

export function remoteFunctionResult(result: RemoteFunctionResult): WASM.Value<Type> | Exception {
    if (!result.success) {
        return {text: result.error.toString("utf8") || "Remote function invocation failed."};
    }
    if (result.results.length === 0) {
        return nothing;
    }
    return protocolValue(result.results[0]);
}

function protocolValue(value: ProtocolValue): WASM.Value<Type> {
    const fields = [
        value.i32Bits === undefined ? undefined : "i32",
        value.i64Bits === undefined ? undefined : "i64",
        value.f32Bits === undefined ? undefined : "f32",
        value.f64Bits === undefined ? undefined : "f64"
    ].filter((field): field is string => field !== undefined);

    if (fields.length !== 1 || value.raw !== undefined) {
        throw Error("Remote function result contains no supported WASM value.");
    }

    switch (fields[0]) {
        case "i32":
            return {value: WasmInt.finite(signed(BigInt(value.i32Bits!), 32)), type: WASM.Integer.i32};
        case "i64":
            return {value: WasmInt.finite(signed(value.i64Bits!, 64)), type: WASM.Integer.i64};
        case "f32":
            return {value: floatFromBits(value.f32Bits!, 4), type: WASM.Float.f32};
        case "f64":
            return {value: floatFromBits(value.f64Bits!, 8), type: WASM.Float.f64};
        default:
            throw Error("Remote function result contains no supported WASM value.");
    }
}

function floatFromBits(bits: number | bigint, bytes: 4 | 8): number {
    const buffer = Buffer.allocUnsafe(bytes);
    if (bytes === 4) {
        buffer.writeUInt32LE(Number(bits));
        return buffer.readFloatLE();
    }
    buffer.writeBigUInt64LE(BigInt(bits));
    return buffer.readDoubleLE();
}

export function signed(value: bigint, bits = 32) {
    const x = value;
    const sign = 1n << BigInt(bits - 1);
    const mod = 1n << BigInt(bits);
    return x >= sign ? x - mod : x;

}

