import test from 'ava';
import {operationResultParser, remoteFunctionResultParser, signed} from "../../src/messaging/Parsers";
import {Expected, Kind, Message, Step, WASM} from "../../src";
import {Command, OperationResult, RemoteFunctionResult} from "../../src/protocol/vendor/debug";
import {Verifier} from "../../src/framework/Verifier";
import WasmInt = WASM.WasmInt;
import {Outcome} from "../../src/reporter/Outcome";

/**
 * Check unsigned 32-bit integer to signed conversion
 */
test('[signed] : 32-bit unsigned to signed', t => {
    t.is(signed(0n, 32), 0n);
    t.is(signed(1n, 32), 1n);
    t.is(signed(127n, 32), 127n);
    t.is(signed(128n, 32), 128n);
    t.is(signed(2147483647n, 32), 2147483647n);
    t.is(signed(2147483648n, 32), -2147483648n);
    t.is(signed(4294967294n, 32), -2n);
    t.is(signed(4294967295n, 32), -1n);
});

/**
 * Check unsigned 64-bit integer to signed conversion
 */
test('[signed] : 64-bit unsigned to signed', t => {
    t.is(signed(0n, 64), 0n);
    t.is(signed(1n, 64), 1n);
    t.is(signed(127n, 64), 127n);
    t.is(signed(128n, 64), 128n);
    t.is(signed(2147483648n, 64), 2147483648n);
    t.is(signed(4294967295n, 64), 4294967295n);
    t.is(signed(18446744073709551615n, 64), -1n);
    t.is(signed(18446744073709551489n, 64), -127n);
});

test("[protobuf invoke result] : decodes signed i64 boundaries", t => {
    for (const [bits, expected] of [[0n, 0n], [0xffffffffffffffffn, -1n], [0x8000000000000000n, -9223372036854775808n]]) {
        const result = remoteFunctionResultParser(RemoteFunctionResult.encode({success: true, results: [{i64Bits: bits, index: 0}], error: Buffer.alloc(0)}).finish());
        t.false("text" in result);
        if ("text" in result) return;
        t.is(result.type, WASM.Integer.i64);
        t.is((result.value as WasmInt).toBigInt(), expected);
    }
});

test("[protobuf invoke result] : decodes IEEE-754 float bits", t => {
    const f32 = remoteFunctionResultParser(RemoteFunctionResult.encode({success: true, results: [{f32Bits: 0x3fc00000, index: 0}], error: Buffer.alloc(0)}).finish());
    const f64 = remoteFunctionResultParser(RemoteFunctionResult.encode({success: true, results: [{f64Bits: 0x4004000000000000n, index: 0}], error: Buffer.alloc(0)}).finish());

    t.false("text" in f32);
    t.false("text" in f64);
    if ("text" in f32 || "text" in f64) return;
    t.deepEqual(f32, {type: WASM.Float.f32, value: 1.5});
    t.deepEqual(f64, {type: WASM.Float.f64, value: 2.5});
});

test("[protobuf invoke result] : maps void, malformed, and failed responses", t => {
    const voidResult = remoteFunctionResultParser(RemoteFunctionResult.encode({success: true, results: [], error: Buffer.alloc(0)}).finish());
    t.deepEqual(voidResult, WASM.nothing);

    const failure = remoteFunctionResultParser(RemoteFunctionResult.encode({success: false, results: [], error: Buffer.from("division by zero")}).finish());
    t.deepEqual(failure, {text: "division by zero"});

    const malformed = RemoteFunctionResult.encode({success: true, results: [{index: 0}], error: Buffer.alloc(0)}).finish();
    t.throws(() => remoteFunctionResultParser(malformed), {message: /no supported WASM value/});
});

test("[verifier] : numeric mismatch is reported as failure, not missing field", t => {
    const step: Step = {
        title: 'CHECK: numeric mismatch',
        instruction: {
            kind: Kind.Request,
            value: Message.invoke('unused', [])
        },
        expected: [{'value': {kind: 'primitive', value: -8.881785255792436e-16} as Expected<number>}]
    };

    const result = new Verifier(step).verify({value: 0, type: 'f32'});

    t.is(result.outcome, Outcome.failed);
    t.false(result.clarification.includes(`state does not contain 'value'`));
    t.true(result.clarification.includes('Expected'));
});


test("[operation result] rejects failed and mismatched operations", t => {
    const failed = OperationResult.encode({command: Command.COMMAND_RESET, success: false}).finish();
    t.throws(() => operationResultParser(Command.COMMAND_RESET, failed), {message: /COMMAND_RESET failed/});
    const mismatched = OperationResult.encode({command: Command.COMMAND_UPDATE_LOCAL, success: true}).finish();
    t.throws(() => operationResultParser(Command.COMMAND_RESET, mismatched), {message: /expected/});
});
