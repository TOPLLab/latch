import {ReporterRunState} from '../ReporterState';

export function pad(text: string, width: number): string {
    if (text.length >= width) {
        return `${text} `;
    }

    return text + ' '.repeat(width - text.length);
}

export function align(text: string, width: number): string {
    if (text.length >= width) {
        return text;
    }

    return text + ' '.repeat(width - text.length);
}

export function alignRight(text: string, width: number): string {
    if (text.length >= width) {
        return text;
    }

    return ' '.repeat(width - text.length) + text;
}

export function plural(count: number, singular: string, pluralForm: string = `${singular}s`): string {
    return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function duration(run: ReporterRunState): number {
    return Math.max(0, Math.round((run.finishedAt ?? Date.now()) - run.startedAt));
}
