import {Reporter} from './Reporter';
import {PlainReporter} from './PlainReporter';
import {InkReporter} from './ink/InkReporter';
import {StyleType, Verbosity} from './index';

export enum ReporterSelection {
    auto = 'auto',
    plain = 'plain',
    ink = 'ink'
}

export function reporterSelectionFromEnvironment(): ReporterSelection {
    switch (process.env.LATCH_REPORTER) {
        case ReporterSelection.plain:
            return ReporterSelection.plain;
        case ReporterSelection.ink:
            return ReporterSelection.ink;
        case ReporterSelection.auto:
        default:
            return ReporterSelection.auto;
    }
}

export class ReporterFactory {
    static create(style: StyleType = StyleType.plain, verbosity: Verbosity = Verbosity.normal, selection: ReporterSelection = reporterSelectionFromEnvironment()): Reporter {
        if (selection === ReporterSelection.plain) {
            return new PlainReporter(style, verbosity);
        }

        if (selection === ReporterSelection.ink) {
            return new InkReporter(style, verbosity);
        }

        if (style === StyleType.github) {
            return new PlainReporter(style, verbosity);
        }

        if (process.stdout.isTTY) {
            return new InkReporter(style, verbosity);
        }

        return new PlainReporter(style, verbosity);
    }
}
