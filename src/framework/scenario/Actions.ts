import {setTimeout} from 'timers/promises';
import {Testee} from '../Testee';
import {TestbedEvents} from '../../testbeds/Testbed';
import {Breakpoint} from '../../debug/Breakpoint';
import {breakpointHitParser} from '../../messaging/Parsers';

export interface Dictionary {
    [index: string]: any;
}

//export type Assertable<T> = T extends Object ? {[index: string]: any} : void;
export type Assertable<T extends Object | void> = {[index: string]: any};

export function assertable(obj: Object): Assertable<Object> {
    return obj as Dictionary;
}

export interface Action<T extends Object | void> {
    act: (testee: Testee) => Promise<Assertable<T>>;
}

export interface PureAction<T extends Object | void> extends Action<T> {
    act: () => Promise<Assertable<T>>;
}

export function wait(time: number): PureAction<void> {
    return {act: () => setTimeout(time)}
}

export function awaitBreakpoint(): Action<Breakpoint> {
    return {
        act: (testee: Testee) => {
            return new Promise<Assertable<Breakpoint>>((resolve) => {
                function breakpointListener(message: string) {
                    // check breakpoint hit message
                    try {
                        const breakpoint = breakpointHitParser(message);
                        // on success: remove listener + resolve
                        testee.bed()?.removeListener(TestbedEvents.OnMessage, breakpointListener);
                        resolve(assertable(breakpoint));
                    } catch (e) {

                    }
                }

                // await breakpoint hit
                testee.bed()?.on(TestbedEvents.OnMessage, breakpointListener)
            });
        }
    };
}

//                testee.testbed?.on(TestbedEvents.OnBreakpointHit, (breakpoint: Breakpoint) => {
//                     resolve(assertable(breakpoint));
//                 })
