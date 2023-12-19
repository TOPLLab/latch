import {setTimeout} from 'timers/promises';

export type Action<T> = () => Promise<T>;

export function wait(time: number): Action<boolean> {
    return () => setTimeout(time).then(() => true)
}
