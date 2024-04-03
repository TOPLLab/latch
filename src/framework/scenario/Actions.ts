import {setTimeout} from 'timers/promises';
import {TestBed} from '../Testbed';
import {TestbedEvents} from '../../testbeds/Testee';
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

export function none(): Assertable<void> {
    return {};
}

export interface Action<T extends Object | void> {
    act: (testee: TestBed) => Promise<Assertable<T>>;
}

export interface PureAction<T extends Object | void> extends Action<T> {
    act: () => Promise<Assertable<T>>;
}

export function wait(time: number): PureAction<void> {
    return {act: () => setTimeout(time)}
}

export function awaitBreakpoint(): Action<Breakpoint> {
    return {
        act: (testbed: TestBed) => {
            return new Promise<Assertable<Breakpoint>>((resolve) => {
                function breakpointListener(message: string) {
                    // check breakpoint hit message
                    try {
                        const breakpoint = breakpointHitParser(message);
                        // on success: remove listener + resolve
                        testbed.testee?.removeListener(TestbedEvents.OnMessage, breakpointListener);
                        resolve(assertable(breakpoint));
                    } catch (e) {

                    }
                }

                // await breakpoint hit
                testbed.testee?.on(TestbedEvents.OnMessage, breakpointListener)
            });
        }
    };
}

//                testee.testbed?.on(TestbedEvents.OnBreakpointHit, (breakpoint: Breakpoint) => {
//                     resolve(assertable(breakpoint));
//                 })
