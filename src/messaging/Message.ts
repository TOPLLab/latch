import {WARDuino} from '../debug/WARDuino';
import {ackParser, breakpointParser, invokeParser, stateParser} from './Parsers';
import {Breakpoint} from '../debug/Breakpoint';
import {WASM} from '../sourcemap/Wasm';
import ieee754 from 'ieee754';
import {SourceMap} from '../sourcemap/SourceMap';
import Interrupt = WARDuino.Interrupt;
import State = WARDuino.State;
import Value = WASM.Value;
import Type = WASM.Type;

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

    export const updateModule: Request<Ack> = {
        type: Interrupt.updateModule,
        parser: (line: string) => {
            return ackParser(line, 'CHANGE Module');
        }
    }

    export function invoke(func: string, args: Value[]): Request<WASM.Value | Exception> {
        function fidx(map: SourceMap.Mapping, func: string): number {
            const fidx: number | void = map.functions.find((closure: SourceMap.Closure) => closure.name === func)?.index;
            if (fidx) {
                throw Error(`Sourcemap: index of ${func} not found.`);
            }
            return fidx!;
        }

        function convert(args: Value[]) {
            let payload: string = '';
            args.forEach((arg: Value) => {
                if (arg.type === Type.i32 || arg.type === Type.i64) {
                    payload += WASM.leb128(arg.value);
                } else {
                    const buff = Buffer.alloc(arg.type === Type.f32 ? 4 : 8);
                    ieee754.write(buff, arg.value, 0, true, 23, buff.length);
                    payload += buff.toString('hex');
                }
            });
            return payload;
        }

        return {
            type: Interrupt.invoke,
            payload: (map: SourceMap.Mapping) => `${WASM.leb128(fidx(map, func))}${convert(args)}`,
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
}
