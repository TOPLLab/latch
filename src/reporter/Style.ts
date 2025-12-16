import {blue, bold, green, inverse, red, yellow} from 'ansi-colors';
import {StyleType} from './index';

interface Styler {
    (s: string): string;
}

interface Colors {
    highlight: Styler;
    success: Styler;
    skipped: Styler;
    failure: Styler;
    failureMessage: Styler;
    error: Styler;
}

interface Labels {
    suiteSuccess: string;
    suiteSkipped: string;

    success: string;
    skipped: string;
    failure: string;
    error: string;
}

// strategy factory
export function styling(type: StyleType): Style {
    switch (type) {
    case StyleType.github:
    case StyleType.plain:
    default:
        return new Plain();
    }
}

// strategy pattern
export interface Style {
    readonly type: StyleType;

    indentation: number;

    bullet: string;
    end: string;

    emph: Styler;

    colors: Colors;
    labels: Labels;
}

export class Plain implements Style {
    type = StyleType.plain;
    indentation = 2;
    bullet = '● ';
    end = '';
    emph = (s: string) => bold(s);
    colors: Colors = {
        highlight: (s: string) => bold(blue(s)),
        success: (s: string) => inverse(bold(green(s))),
        skipped: (s: string) => inverse(bold(yellow(s))),
        failure: (s: string) => inverse(bold(red(s))),
        failureMessage: (s: string) => red(s),
        error: (s: string) => inverse(bold(red(s)))
    };
    labels: Labels = {
        suiteSuccess: ' PASSED ',
        suiteSkipped: ' SKIPPED ',
        success: ' PASS ',
        skipped: ' SKIP ',
        failure: ' FAIL ',
        error: ' ERROR '
    }
}

export class GitHub extends Plain {
    type = StyleType.github;
    bullet = '::group::';
    end = '::endgroup::';
}
