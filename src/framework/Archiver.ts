import {writeFileSync} from 'fs';

export class Archiver {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly information: any;
    public readonly archive: string;

    constructor(file: string) {
        this.information = new Map<string, string[]>();
        this.archive = file;
    }

    public set(key: string, value: string | number) {
        this.information[key] = value;
    }

    public extend(key: string, value: string | number) {
        if (!Object.prototype.hasOwnProperty.call(this.information, key)) {
            this.information[key] = [];
        }
        this.information[key].push(value);
    }

    public write() {
        writeFileSync(this.archive, `${JSON.stringify(this.information, null, 2)}\n`, {flag: 'w'});
    }

    // TODO also add access functions to compare with previous runs
}