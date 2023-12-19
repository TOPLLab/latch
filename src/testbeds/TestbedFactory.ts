import {Testbed} from './Testbed';
import {ARDUINO, EMULATOR, WABT} from '../util/deps';
import {CompileOutput, CompilerFactory} from '../manage/Compiler';
import {Emulator} from './Emulator';
import {UploaderFactory} from '../manage/Uploader';
import {Connection} from '../bridge/Connection';
import {Arduino} from './Arduino';
import {Serial} from '../bridge/Serial';
import {SubProcess} from '../bridge/SubProcess';
import {TestbedSpecification, PlatformType} from './TestbedSpecification';

export class TestbedFactory {
    private readonly defaultTimeout: number;
    private readonly compilerFactory: CompilerFactory;
    private readonly uploaderFactory: UploaderFactory;

    constructor(timeout: number = 5000) {
        this.defaultTimeout = timeout;
        this.compilerFactory = new CompilerFactory(WABT);
        this.uploaderFactory = new UploaderFactory(EMULATOR, ARDUINO);
    }

    public async initialize(specification: TestbedSpecification, program: string, args: string[]): Promise<Testbed> {
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

    public timeout(platform: PlatformType): number {
        switch (platform) {
            case PlatformType.arduino:
                return 0;  // No time out for arduino upload
            case PlatformType.emulator:
            default:
                return this.defaultTimeout;
        }
    }
}
