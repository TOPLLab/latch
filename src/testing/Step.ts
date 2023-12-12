import {Action, Instruction} from "./Actions";

export enum Description {
    /** required properties */
    defined,
    notDefined
}

export enum Behaviour {
    /** compare with a previous state (always fails if no previous state): */
    unchanged,
    changed,
    increased,
    decreased
}

export type Expected<T> =
/** discrimination union */
    | { kind: 'primitive'; value: T }
    | { kind: 'description'; value: Description }
    | { kind: 'comparison'; value: (state: Object, value: T) => boolean; message?: string }
    | { kind: 'behaviour'; value: Behaviour };

export interface Expectation {
    [key: string]: Expected<any>;
}

export interface Step {
    /** Name of the test */
    readonly title: string;

    /** Type of the instruction */
    readonly instruction: Instruction | Action;

    /* Optional payload of the instruction */
    readonly payload?: any;

    /** Whether the instruction is expected to return data */
    readonly expectResponse?: boolean;  // todo remove

    /** Optional delay after sending instruction */
    readonly delay?: number;  // todo remove (can be done with an Action)

    /** Parser to use on the result. */
    readonly parser?: (input: string) => Object;

    /** Checks to run against the result. */
    readonly expected?: Expectation[];
}