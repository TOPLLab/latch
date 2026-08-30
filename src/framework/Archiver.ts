import {writeFileSync} from 'fs';

export class Archiver {
    private readonly information: Record<string, unknown> = {};
    public readonly archive: string;

    constructor(file: string) {
        this.archive = file;
    }

    public set(key: string, value: unknown) {
        this.information[key] = value;
    }

    public extend(key: string, value: string | number) {
        const values = this.information[key];
        if (!Array.isArray(values)) {
            this.information[key] = [];
        }
        (this.information[key] as (string | number)[]).push(value);
    }

    public write() {
        writeFileSync(this.archive, `${JSON.stringify(this.information, null, 2)}\n`, {flag: 'w'});
    }

    // TODO also add access functions to compare with previous runs
}
