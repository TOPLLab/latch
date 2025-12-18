import {WARDuino} from '../debug/WARDuino';
import {ackParser, breakpointParser, invokeParser, stateParser} from './Parsers';
import {Breakpoint} from '../debug/Breakpoint';
import {WASM} from '../sourcemap/Wasm';
import ieee754 from 'ieee754';
import {SourceMap} from '../sourcemap/SourceMap';
import {readFileSync} from 'fs';
import {CompileOutput, CompilerFactory} from '../manage/Compiler';
import {WABT} from '../util/env';
import Interrupt = WARDuino.Interrupt;
import State = WARDuino.State;
import Value = WASM.Value;
import Type = WASM.Type;
import Float = WASM.Float;

// An acknowledgement returned by the debugger
export interface Ack {
    text: string
}

export interface Exception extends Ack {
}

// A request represents a debug message and its parser
export interface Request<R> {
    type: Interrupt,            // type of the debug message (pause, run, step, ...)
    payload?: (map: SourceMap.Mapping) => string,             // optional payload of the debug message
    parser: (input: string) => R  // the parser for the response to the debug message
}

export namespace Message {
    import Float = WASM.Float;
    export const run: Request<Ack> = {
        type: Interrupt.run,
        parser: (line: string) => {
            return ackParser(line, 'GO');
        }
    };

    export const halt: Request<Ack> = {
        type: Interrupt.halt,
        parser: (line: string) => {
            return ackParser(line, 'STOP');
        }
    };

    export const pause: Request<Ack> = {
        type: Interrupt.pause,
        parser: (line: string) => {
            return ackParser(line, 'PAUSE');
        }
    };

    export const step: Request<Ack> = {
        type: Interrupt.step,
        parser: (line: string) => {
            return ackParser(line, 'STEP');
        }
    };

    export const stepOver: Request<Ack> = {
        type: Interrupt.stepOver,
        parser: (line: string): Ack => {
            try {
                return ackParser(line, 'STEP');
            } catch (err) {
                return ackParser(line, 'AT ');
            }
        }
    };

    export function addBreakpoint(payload: Breakpoint): Request<Breakpoint> {
        return {
            type: Interrupt.addBreakpoint,
            payload: () => payload.toString(),
            parser: breakpointParser
        };
    }

    export function removeBreakpoint(payload: Breakpoint): Request<Breakpoint> {
        return {
            type: Interrupt.removeBreakpoint,
            payload: () => payload.toString(),
            parser: breakpointParser
        };
    }

    export function inspect(payload: string): Request<State> {
        return {
            type: Interrupt.inspect,
            payload: () => payload,
            parser: stateParser
        }
    }

    export const dump: Request<State> = {
        type: Interrupt.dump,
        parser: stateParser
    };

    export const dumpLocals: Request<State> = {
        type: Interrupt.dumpLocals,
        parser: stateParser
    };

    export const dumpAll: Request<State> = {
        type: Interrupt.dumpAll,
        parser: stateParser
    };

    export const reset: Request<Ack> = {
        type: Interrupt.reset,
        parser: (line: string) => {
            return ackParser(line, 'RESET');
        }
    };

    export const updateFunction: Request<Ack> = {
        type: Interrupt.updateFunction,
        parser: (line: string) => {
            return ackParser(line, 'CHANGE function');
        }
    }

    export const updateLocal: Request<Ack> = {
        type: Interrupt.updateLocal,
        parser: (line: string) => {
            return ackParser(line, 'CHANGE local');
        }
    }

    export async function uploadFile(program: string): Promise<Request<Ack>> {
        const compiled: CompileOutput = await new CompilerFactory(WABT).pickCompiler(program).compile(program);
        return updateModule(compiled.file);
    }

    export function updateModule(wasm: string): Request<Ack> {
        function payload(binary: Buffer): string {
            const w = new Uint8Array(binary);
            const sizeHex: string = WASM.leb128(BigInt(w.length));
            const sizeBuffer = Buffer.allocUnsafe(4);
            sizeBuffer.writeUint32BE(w.length);
            const wasmHex = Buffer.from(w).toString('hex');
            return sizeHex + wasmHex;
        }

        return {
            type: Interrupt.updateModule,
            payload: () => payload(readFileSync(wasm)),
            parser: (line: string) => {
                return ackParser(line, 'CHANGE Module');
            }
        }
    }

    export function pushEvent(topic: string, payload: string): Request<Ack> {
        return {
            type: Interrupt.pushEvent,
            payload: () => `{topic: '${topic}', payload: '${payload}'}`,
            parser: (line: string) => {
                return ackParser(line, 'Interrupt: 73');
            }
        }
    }

    export function invoke(func: string, args: Value<Type>[]): Request<WASM.Value<Type> | Exception> {
        function fidx(map: SourceMap.Mapping, func: string): number {
            const fidx: number | void = map.functions.find((closure: SourceMap.Closure) => closure.name === func)?.index;
            if (fidx === undefined) {
                throw Error(`Sourcemap: index of ${func} not found.`);
            }
            return fidx!;
        }

        function convert(args: Value<Type>[]) {
            let payload: string = '';
            args.forEach((arg: Value<Type>) => {
                switch (arg.type) {
                    case WASM.Float.f32:
                    case WASM.Float.f64:
                        payload += ieeefloat(<Value<Float>>arg)
                        break;
                    case WASM.Integer.i32:
                    case WASM.Integer.i64:
                        payload += WASM.leb128(<bigint>arg.value);
                        break;
                    default:
                        break;
                }
            });
            return payload;
        }

        return {
            type: Interrupt.invoke,
            payload: (map: SourceMap.Mapping) => `${WASM.leb128(BigInt(fidx(map, func)))}${convert(args)}`,
            parser: invokeParser
        }
    }

    export const snapshot: Request<State> = {
        type: Interrupt.snapshot,
        parser: stateParser
    }

    export const dumpAllEvents: Request<State> = {
        type: Interrupt.dumpAllEvents,
        parser: stateParser
    }

    export const dumpEvents: Request<State> = {
        type: Interrupt.dumpEvents,
        parser: stateParser
    }

    export const dumpCallbackmapping: Request<State> = {
        type: Interrupt.dumpCallbackmapping,
        parser: stateParser
    }

    export const proxifyRequest: Request<Ack> = {
        type: Interrupt.proxify,
        parser: (line: string) => {
            return ackParser(line, 'PROXIED');
        }
    };
}

function ieeefloat(arg: Value<Float>): String {
    const buff = Buffer.alloc(arg.type === Float.f32 ? 4 : 8);
    ieee754.write(buff, <number>arg.value, 0, true, arg.type === Float.f32 ? 23 : 52, buff.length); // TODO write BigInt without loss of precision (don't use ieee754.write)
    return buff.toString('hex');
}