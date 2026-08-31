/* eslint-disable @typescript-eslint/no-explicit-any */
import {setTimeout} from 'timers/promises';
import {Testee} from '../Testee';
import {TestbedEvents} from '../../testbeds/Testbed';
import {Breakpoint} from '../../debug/Breakpoint';
import {DebugFrame} from '../../protocol/frame';
import {HitBreakpoint, NotificationType} from '../../protocol/vendor/debug';

export interface Dictionary {
    [index: string]: any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                function breakpointListener(frame: DebugFrame) {
                    if (frame.type !== NotificationType.NOTIFICATION_HIT_BREAKPOINT) return;
                    const location = HitBreakpoint.decode(frame.payload).location;
                    if (location === undefined) return;
                    testee.bed()?.removeListener(TestbedEvents.OnMessage, breakpointListener);
                    resolve(assertable(new Breakpoint(location.programCounter, 0)));
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
