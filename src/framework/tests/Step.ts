import {Action} from './Actions';
import {Request} from '../../messaging/Message'

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

export enum Kind {
    Request = 'request',
    Action = 'action'
}

export type Instruction<T> =
/** discrimination union */
    | { kind: Kind.Request; value: Request<T> }
    | { kind: Kind.Action; value: Action<T> };

export interface Step {
    readonly title: string;

    readonly instruction: Instruction<Object>;

    readonly expected?: Expectation[];
}