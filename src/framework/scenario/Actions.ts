import {setTimeout} from 'timers/promises';
import {Testee} from '../Testee';
import {TestbedEvents} from '../../testbeds/Testbed';
import {Breakpoint} from '../../debug/Breakpoint';
import {breakpointHitParser} from '../../messaging/Parsers';

export interface Action<T> {
    act: (testee: Testee) => Promise<T>;
}

export interface PureAction<T> extends Action<T> {
    act: () => Promise<T>;
}

export function wait(time: number): PureAction<boolean> {
    return {act: () => setTimeout(time).then(() => true)}
}

export function awaitBreakpoint(): Action<Breakpoint> {
    return {
        act: (testee: Testee) => {
            return new Promise<Breakpoint>((resolve) => {
                function breakpointListener(message: string) {
                    // check breakpoint hit message
                    try {
                        const breakpoint = breakpointHitParser(message);
                        // on success: remove listener + resolve
                        testee.testbed?.removeListener(TestbedEvents.OnMessage, breakpointListener);
                        resolve(breakpoint);
                    } catch (e) {

                    }
                }

                // await breakpoint hit
                testee.testbed?.on(TestbedEvents.OnMessage, breakpointListener)
            });
        }
    };
}
