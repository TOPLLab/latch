import {MessageType} from '../debug/MessageType';
import {WARDuino} from '../debug/WARDuino';
import {ackParser, breakpointParser, invokeParser, stateParser} from './Parsers';
import {Breakpoint} from '../debug/Breakpoint';
import {WASM} from '../sourcemap/Wasm';
import ieee754 from 'ieee754';
import {SourceMap} from '../sourcemap/SourceMap';

// An acknowledgement returned by the debugger
export interface Ack {
    text: string
}

export interface Exception extends Ack {
}

// A request represents a debug message and its parser
export interface Request<R> {
    type: MessageType,            // type of the debug message (pause, run, step, ...)
    payload?: (map: SourceMap.Mapping) => string,             // optional payload of the debug message
    parser: (input: string) => R  // the parser for the response to the debug message
}

export namespace Message {
    import State = WARDuino.State;
    import Value = WASM.Value;
    import Type = WASM.Type;
    export const run: Request<Ack> = {
        type: MessageType.run,
        parser: (line: string) => {
            return ackParser(line, 'GO');
        }
    };

    export const halt: Request<Ack> = {
        type: MessageType.halt,
        parser: (line: string) => {
            return ackParser(line, 'STOP');
        }
    };

    export const pause: Request<Ack> = {
        type: MessageType.pause,
        parser: (line: string) => {
            return ackParser(line, 'PAUSE');
        }
    };

    export const step: Request<Ack> = {
        type: MessageType.step,
        parser: (line: string) => {
            return ackParser(line, 'STEP');
        }
    };

    export function addBreakpoint(payload: Breakpoint): Request<Breakpoint> {
        return {
            type: MessageType.addBreakpoint,
            payload: () => payload.toString(),
            parser: breakpointParser
        };
    }

    export function removeBreakpoint(payload: Breakpoint): Request<Breakpoint> {
        return {
            type: MessageType.removeBreakpoint,
            payload: () => payload.toString(),
            parser: breakpointParser
        };
    }

    export function inspect(payload: string): Request<State> {
        return {
            type: MessageType.inspect,
            payload: () => payload,
            parser: stateParser
        }
    }

    export const dump: Request<State> = {
        type: MessageType.dump,
        parser: stateParser
    };

    export const dumpLocals: Request<State> = {
        type: MessageType.dumpLocals,
        parser: stateParser
    };

    export const dumpAll: Request<State> = {
        type: MessageType.dumpAll,
        parser: stateParser
    };

    export const reset: Request<Ack> = {
        type: MessageType.reset,
        parser: (line: string) => {
            return ackParser(line, 'RESET');
        }
    };

    export const updateFunction: Request<Ack> = {
        type: MessageType.updateFunction,
        parser: (line: string) => {
            return ackParser(line, 'CHANGE function');
        }
    }

    export const updateLocal: Request<Ack> = {
        type: MessageType.updateLocal,
        parser: (line: string) => {
            return ackParser(line, 'CHANGE local');
        }
    }

    export const updateModule: Request<Ack> = {
        type: MessageType.updateModule,
        parser: (line: string) => {
            return ackParser(line, 'CHANGE Module');
        }
    }

    export function invoke(func: string, args: Value[]): Request<State | Exception> {
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
            type: MessageType.invoke,
            payload: (map: SourceMap.Mapping) => `${WASM.leb128(fidx(map, func))}${convert(args)}`,
            parser: invokeParser
        }
    }

    export const snapshot: Request<State> = {
        type: MessageType.snapshot,
        parser: stateParser
    }

    export const dumpAllEvents: Request<State> = {
        type: MessageType.dumpAllEvents,
        parser: stateParser
    }

    export const dumpEvents: Request<State> = {
        type: MessageType.dumpEvents,
        parser: stateParser
    }

    export const dumpCallbackmapping: Request<State> = {
        type: MessageType.dumpCallbackmapping,
        parser: stateParser
    }
}
