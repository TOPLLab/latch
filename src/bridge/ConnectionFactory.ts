import {Connection} from './Connection';
import {EMULATOR, WABT} from './Bridge';
import {CompileOutput, CompilerFactory} from '../manage/Compiler';
import {Emulator} from "./Emulator";
import {UploaderFactory} from '../manage/Uploader';
import {ARDUINO} from '../../example/src/util/warduino.bridge';
import {Medium} from './Medium';
import {Arduino} from './Arduino';
import {Serial} from './Serial';
import {SubProcess} from './SubProcess';

export enum PlatformType {
    arduino,
    emulator,
}

export interface Options {
    path?: string
    port?: number
}

export class ConnectionFactory {
    public readonly connectionTimeout: number;


    private readonly compilerFactory: CompilerFactory;
    private readonly uploaderFactory: UploaderFactory;

    constructor(timeout: number = 2000) {
        this.connectionTimeout = timeout;
        this.compilerFactory = new CompilerFactory(WABT);
        this.uploaderFactory = new UploaderFactory(EMULATOR, ARDUINO);
    }

    public async connect(type: PlatformType, program: string, args: string[], options?: Options): Promise<Connection> {
        let compiled: CompileOutput = await this.compilerFactory.pickCompiler(program).compile(program);
        let medium: Medium = await this.uploaderFactory.pickUploader(type, args, options).upload(compiled);

        switch (type) {
            case PlatformType.arduino:
                return new Arduino(medium as Serial);
            case PlatformType.emulator:
                return new Emulator(medium as SubProcess);
            default:
                return Promise.reject('Platform not implemented.');
        }
    }
}
