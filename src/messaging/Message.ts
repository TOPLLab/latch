import {WARDuino} from '../debug/WARDuino';
import {Breakpoint} from '../debug/Breakpoint';
import {WASM} from '../sourcemap/Wasm';
import {SourceMap} from '../sourcemap/SourceMap';
import {readFileSync} from "fs";
import {operationResultParser, remoteFunctionResultParser} from "./Parsers";
import {CompileOutput, CompilerFactory} from '../manage/Compiler';
import {WABT} from '../util/env';
import WasmValue = WASM.Value;
import Type = WASM.Type;
import {
    Breakpoint as ProtocolBreakpoint,
    CallbackMapping,
    Checkpoint,
    Command,
    Event as ProtocolEvent,
    EventsQueue,
    FunctionMessage,
    HitBreakpoint,
    Inspect as ProtocolInspect,
    Locals,
    ModuleUpdate,
    NotificationType,
    OperationResult,
    Range,
    RemoteFunctionCall,
    ValueUpdate,
    Snapshot,
    Value as ProtocolValue
} from '../protocol/vendor/debug';

// An acknowledgement returned by the debugger
export interface Ack {
    text: string
}

export type Exception = Ack;

const emptyNotification = (payload: Uint8Array): void => {
    if (payload.length !== 0) throw Error('Expected an empty notification payload.');
};

export const notificationParsers = {
    [NotificationType.NOTIFICATION_CONTINUED]: emptyNotification,
    [NotificationType.NOTIFICATION_HALTED]: emptyNotification,
    [NotificationType.NOTIFICATION_PAUSED]: emptyNotification,
    [NotificationType.NOTIFICATION_STEPPED]: emptyNotification,
    [NotificationType.NOTIFICATION_HIT_BREAKPOINT]: HitBreakpoint.decode,
    [NotificationType.NOTIFICATION_NEW_EVENT]: emptyNotification,
    [NotificationType.NOTIFICATION_FUNCTION_DUMP]: FunctionMessage.decode,
    [NotificationType.NOTIFICATION_LOCALS_DUMP]: Locals.decode,
    [NotificationType.NOTIFICATION_SNAPSHOT]: Snapshot.decode,
    [NotificationType.NOTIFICATION_EVENTS_DUMP]: EventsQueue.decode,
    [NotificationType.NOTIFICATION_CALLBACKS_DUMP]: CallbackMapping.decode,
    [NotificationType.NOTIFICATION_CHANGE_AFFECTED]: emptyNotification,
    [NotificationType.NOTIFICATION_MALFORMED]: emptyNotification,
    [NotificationType.NOTIFICATION_UNKNOWN_COMMAND]: emptyNotification,
    [NotificationType.NOTIFICATION_OPERATION_RESULT]: OperationResult.decode,
    [NotificationType.NOTIFICATION_REMOTE_FUNCTION_RESULT]: remoteFunctionResultParser,
    [NotificationType.NOTIFICATION_CHECKPOINT]: Checkpoint.decode
} as const;

export type Notification = keyof typeof notificationParsers;
export type NotificationResult<N extends Notification> = ReturnType<(typeof notificationParsers)[N]>;

// A request represents a debug message and its parser
export interface Request<R> {
    type: Command,
    notification: NotificationType,
    payload?: (map: SourceMap.Mapping) => Uint8Array,
    parser: (payload: Uint8Array) => R
}

/* eslint-disable @typescript-eslint/no-namespace */
export namespace Message {
    import Inspect = WARDuino.Inspect;
    import Float = WASM.Float;
    import isFloat = WASM.isFloat;

    function operation(command: Command): Request<OperationResult> {
        return {
            type: command,
            notification: NotificationType.NOTIFICATION_OPERATION_RESULT,
            parser: payload => operationResultParser(command, payload),
        };
    }

    export const run: Request<void> = {
        type: Command.COMMAND_RUN,
        notification: NotificationType.NOTIFICATION_CONTINUED,
        parser: notificationParsers[NotificationType.NOTIFICATION_CONTINUED]
    };

    export const halt: Request<void> = {
        type: Command.COMMAND_HALT,
        notification: NotificationType.NOTIFICATION_HALTED,
        parser: notificationParsers[NotificationType.NOTIFICATION_HALTED]
    };

    export const pause: Request<void> = {
        type: Command.COMMAND_PAUSE,
        notification: NotificationType.NOTIFICATION_PAUSED,
        parser: notificationParsers[NotificationType.NOTIFICATION_PAUSED]
    };

    export const step: Request<void> = {
        type: Command.COMMAND_STEP,
        notification: NotificationType.NOTIFICATION_STEPPED,
        parser: notificationParsers[NotificationType.NOTIFICATION_STEPPED]
    };

    export const stepOver: Request<void> = {
        type: Command.COMMAND_STEP_OVER,
        notification: NotificationType.NOTIFICATION_STEPPED,
        parser: notificationParsers[NotificationType.NOTIFICATION_STEPPED]
    };
    export function addBreakpoint(payload: Breakpoint): Request<OperationResult> {
        return {
            ...operation(Command.COMMAND_ADD_BREAKPOINT),
            payload: () => ProtocolBreakpoint.encode({
                location: {moduleIndex: 0, programCounter: payload.id}
            }).finish()
        };
    }

    export function removeBreakpoint(payload: Breakpoint): Request<OperationResult> {
        return {
            ...operation(Command.COMMAND_REMOVE_BREAKPOINT),
            payload: () => ProtocolBreakpoint.encode({
                location: {moduleIndex: 0, programCounter: payload.id}
            }).finish()
        };
    }
    export function inspect(fields: Inspect[]): Request<Snapshot> {
        return {
            type: Command.COMMAND_INSPECT,
            notification: NotificationType.NOTIFICATION_SNAPSHOT,
            payload: () => ProtocolInspect.encode({
                state: Buffer.from(fields.map(field => Number.parseInt(field, 16)))
            }).finish(),
            parser: notificationParsers[NotificationType.NOTIFICATION_SNAPSHOT]
        };
    }

    export const dump: Request<FunctionMessage> = {
        type: Command.COMMAND_DUMP,
        notification: NotificationType.NOTIFICATION_FUNCTION_DUMP,
        parser: notificationParsers[NotificationType.NOTIFICATION_FUNCTION_DUMP]
    };

    export const dumpLocals: Request<Locals> = {
        type: Command.COMMAND_DUMP_LOCALS,
        notification: NotificationType.NOTIFICATION_LOCALS_DUMP,
        parser: notificationParsers[NotificationType.NOTIFICATION_LOCALS_DUMP]
    };

    export const reset: Request<OperationResult> = operation(Command.COMMAND_RESET);
    export function updateFunction(functionMessage: FunctionMessage): Request<OperationResult> {
        return {
            ...operation(Command.COMMAND_UPDATE_FUNCTION),
            payload: () => FunctionMessage.encode(functionMessage).finish()
        };
    }

    export function updateLocal(index: number, value: ProtocolValue): Request<OperationResult> {
        if (!Number.isInteger(index) || index < 0 || value === undefined) {
            throw Error("A local update requires a non-negative integer index and a value.");
        }
        return {
            ...operation(Command.COMMAND_UPDATE_LOCAL),
            payload: () => ValueUpdate.encode({index, value}).finish()
        };
    }

    export async function uploadFile(program: string): Promise<Request<OperationResult>> {
        const compiled: CompileOutput = await new CompilerFactory(WABT).pickCompiler(program).compile(program);
        return updateModule(compiled.file);
    }

    export function updateModule(wasm: string): Request<OperationResult> {
        return {
            ...operation(Command.COMMAND_UPDATE_MODULE),
            payload: () => ModuleUpdate.encode({wasm: readFileSync(wasm)}).finish()
        };
    }

    export function pushEvent(topic: string, payload: string): Request<void> {
        return {
            type: Command.COMMAND_PUSH_EVENT,
            notification: NotificationType.NOTIFICATION_NEW_EVENT,
            payload: () => ProtocolEvent.encode({topic, payload: Buffer.from(payload)}).finish(),
            parser: notificationParsers[NotificationType.NOTIFICATION_NEW_EVENT]
        }
    }

    export function invoke(func: string, args: WasmValue<Type>[]): Request<WasmValue<Type> | Exception> {
        function fidx(map: SourceMap.Mapping, func: string): number {
            const index: number | void = map.functions.find((closure: SourceMap.Closure) => closure.name === func)?.index;
            if (index === undefined) {
                throw Error(`Sourcemap: index of ${func} not found.`);
            }
            return index;
        }

        function convert(arg: WasmValue<Type>, index: number): ProtocolValue {
            if (arg.type === WASM.Integer.i32 || arg.type === WASM.Integer.u32) {
                return {i32Bits: Number(BigInt.asUintN(32, (arg.value as WASM.WasmInt).toBigInt())), index};
            }
            if (arg.type === WASM.Integer.i64 || arg.type === WASM.Integer.u64) {
                return {i64Bits: BigInt.asUintN(64, (arg.value as WASM.WasmInt).toBigInt()), index};
            }
            if (isFloat(arg.type)) {
                const buffer = Buffer.allocUnsafe(arg.type === Float.f32 ? 4 : 8);
                if (arg.type === Float.f32) {
                    buffer.writeFloatLE(Number(arg.value));
                    return {f32Bits: buffer.readUInt32LE(), index};
                }
                buffer.writeDoubleLE(Number(arg.value));
                return {f64Bits: buffer.readBigUInt64LE(), index};
            }
            throw Error(`Cannot invoke a function with a ${arg.type} argument.`);
        }

        return {
            type: Command.COMMAND_INVOKE,
            notification: NotificationType.NOTIFICATION_REMOTE_FUNCTION_RESULT,
            payload: (map: SourceMap.Mapping) => RemoteFunctionCall.encode({
                functionIndex: fidx(map, func),
                arguments: args.map(convert)
            }).finish(),
            parser: notificationParsers[NotificationType.NOTIFICATION_REMOTE_FUNCTION_RESULT]
        }
    }

    export const snapshot: Request<Snapshot> = {
        type: Command.COMMAND_SNAPSHOT,
        notification: NotificationType.NOTIFICATION_SNAPSHOT,
        parser: notificationParsers[NotificationType.NOTIFICATION_SNAPSHOT]
    }

    /** The protocol default range (0, 0) requests the complete event queue. */
    export const dumpAllEvents: Request<EventsQueue> = {
        type: Command.COMMAND_DUMP_EVENTS,
        notification: NotificationType.NOTIFICATION_EVENTS_DUMP,
        payload: () => Range.encode({start: 0, end: 0}).finish(),
        parser: notificationParsers[NotificationType.NOTIFICATION_EVENTS_DUMP]
    }

    export function dumpEvents(range: Range): Request<EventsQueue> {
        if (!Number.isInteger(range.start) || range.start < 0 || !Number.isInteger(range.end) || range.end < 0) {
            throw Error("An event range requires non-negative integer start and end positions.");
        }
        return {
            type: Command.COMMAND_DUMP_EVENTS,
            notification: NotificationType.NOTIFICATION_EVENTS_DUMP,
            payload: () => Range.encode(range).finish(),
            parser: notificationParsers[NotificationType.NOTIFICATION_EVENTS_DUMP]
        };
    }

    export const dumpCallbackmapping: Request<CallbackMapping> = {
        type: Command.COMMAND_DUMP_CALLBACKS,
        notification: NotificationType.NOTIFICATION_CALLBACKS_DUMP,
        parser: notificationParsers[NotificationType.NOTIFICATION_CALLBACKS_DUMP]
    }

    export const proxifyRequest: Request<OperationResult> = operation(Command.COMMAND_PROXIFY);
}
