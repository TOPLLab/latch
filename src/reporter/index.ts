import {MinimalReporter} from './verbosity/minimal';
import {announcer} from './Announcer';

export enum StyleType {
    plain,
    github
}

export enum Verbosity {
    none,
    minimal,
    short,
    normal,
    more,
    all,
    debug
}