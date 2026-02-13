import {Action} from './Actions';
import {Request} from '../../messaging/Message'
import {Target} from '../Testee';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: Expected<any>;
}

export enum Kind {
    Request = 'request',
    Action = 'action'
}

export type Instruction =
/** discrimination union */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | { kind: Kind.Request; value: Request<any> }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | { kind: Kind.Action; value: Action<any> };

export interface Step {
    readonly title: string;

    readonly instruction: Instruction;

    target?: Target;

    readonly expected?: Expectation[];
}