import {Serial} from '../bridge/Serial';
import {Platform} from './Platform';
import {EMULATOR} from "../util/env";
import {Meta} from "./Testbed";
import {execFileAsync} from "../util/util";

export class Arduino extends Platform {
    public readonly name: string = 'Hardware';

    connection: Serial;

    constructor(connection: Serial) {
        super();
        this.connection = connection;

        this.listen();
    }

    async meta(): Promise<string> {
        const {stdout} = await execFileAsync(EMULATOR, ['--version']);
        const version = stdout.match(/\d+\.\d+\.\d+/)?.[0];

        if (version === undefined) {
            throw new Error(`Unable to determine WARDuino version from: ${stdout.trim()}`);
        }

        return JSON.stringify({
            [Meta.Name]: 'warduino',
            [Meta.Architecture]: 'arduino',
            [Meta.Version]: version
        });
    }
}
