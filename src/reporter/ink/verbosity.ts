import {Verbosity} from '../index';

export function preservesFullHistory(verbosity: Verbosity): boolean {
    return verbosity === Verbosity.all || verbosity === Verbosity.debug;
}

export function showsActionDetails(verbosity: Verbosity): boolean {
    return verbosity === Verbosity.more || preservesFullHistory(verbosity);
}

export function showsDebugDetails(verbosity: Verbosity): boolean {
    return verbosity === Verbosity.debug;
}
