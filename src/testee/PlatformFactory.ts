import {Testee} from './Testee';
import {ARDUINO, EMULATOR, WABT} from '../util/deps';
import {CompileOutput, CompilerFactory} from '../manage/Compiler';
import {Emulator} from './Emulator';
import {UploaderFactory} from '../manage/Uploader';
import {Connection} from '../bridge/Connection';
import {Arduino} from './Arduino';
import {Serial} from '../bridge/Serial';
import {SubProcess} from '../bridge/SubProcess';
import {PlatformSpecification, PlatformType} from './PlatformSpecification';

export class PlatformFactory {
    public readonly connectionTimeout: number;

    private readonly compilerFactory: CompilerFactory;
    private readonly uploaderFactory: UploaderFactory;

    constructor(timeout: number = 5000) {
        this.connectionTimeout = timeout;
        this.compilerFactory = new CompilerFactory(WABT);
        this.uploaderFactory = new UploaderFactory(EMULATOR, ARDUINO);
    }

    public async connect(specification: PlatformSpecification, program: string, args: string[]): Promise<Testee> {
        let compiled: CompileOutput = await this.compilerFactory.pickCompiler(program).compile(program);
        let connection: Connection = await this.uploaderFactory.pickUploader(specification, args).upload(compiled);

        switch (specification.type) {
            case PlatformType.arduino:
                return new Arduino(connection as Serial);
            case PlatformType.emulator:
                return new Emulator(connection as SubProcess);
            default:
                return Promise.reject('Platform not implemented.');
        }
    }
}
