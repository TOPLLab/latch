import {Testee} from './Testee';
import {EMULATOR, WABT} from '../util/deps';
import {CompileOutput, CompilerFactory} from '../manage/Compiler';
import {Emulator} from './Emulator';
import {UploaderFactory} from '../manage/Uploader';
import {ARDUINO} from '../../example/src/util/warduino.bridge';
import {Connection} from '../bridge/Connection';
import {Arduino} from './Arduino';
import {Serial} from '../bridge/Serial';
import {SubProcess} from '../bridge/SubProcess';

export enum PlatformType {
    arduino,
    emulator,
}

export interface Options {
    path?: string
    port?: number
}

export class PlatformFactory {
    public readonly connectionTimeout: number;

    private readonly compilerFactory: CompilerFactory;
    private readonly uploaderFactory: UploaderFactory;

    constructor(timeout: number = 5000) {
        this.connectionTimeout = timeout;
        this.compilerFactory = new CompilerFactory(WABT);
        this.uploaderFactory = new UploaderFactory(EMULATOR, ARDUINO);
    }

    public async connect(type: PlatformType, program: string, args: string[], options?: Options): Promise<Testee> {
        let compiled: CompileOutput = await this.compilerFactory.pickCompiler(program).compile(program);
        let connection: Connection = await this.uploaderFactory.pickUploader(type, args, options).upload(compiled);

        switch (type) {
            case PlatformType.arduino:
                return new Arduino(connection as Serial);
            case PlatformType.emulator:
                return new Emulator(connection as SubProcess);
            default:
                return Promise.reject('Platform not implemented.');
        }
    }
}
