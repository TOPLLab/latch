import {Testee} from './Testee';
import {ARDUINO, EMULATOR, WABT} from '../util/env';
import {CompileOutput, CompilerFactory} from '../manage/Compiler';
import {Emulator} from './Emulator';
import {UploaderFactory} from '../manage/Uploader';
import {Connection} from '../bridge/Connection';
import {Arduino} from './Arduino';
import {Serial} from '../bridge/Serial';
import {SubProcess} from '../bridge/SubProcess';
import {PlatformType, TesteeSpecification} from './TesteeSpecification';

export class TesteeFactory {
    public readonly timeout: number;
    private readonly compilerFactory: CompilerFactory;
    private readonly uploaderFactory: UploaderFactory;

    constructor(timeout: number) {
        this.timeout = timeout;
        this.compilerFactory = new CompilerFactory(WABT);
        this.uploaderFactory = new UploaderFactory(EMULATOR, ARDUINO);
    }

    public build(specification: TesteeSpecification) {
        switch (specification.type) {
            case PlatformType.arduino:
                return new Arduino(specification);
            case PlatformType.emulator:
            default: // TODO add unsupported error
                return new Emulator(specification);
        }
    }

    // TODO move initialize to testees
    public async initialize(specification: TesteeSpecification, program: string, args: string[]): Promise<Connection> {
        let compiled: CompileOutput = await this.compilerFactory.pickCompiler(program).compile(program).catch((e) => Promise.reject(e)); // fixme don't do this twice in oop
        let connection: Connection;

        switch (specification.type) {
            case PlatformType.arduino:
                return await this.uploaderFactory.pickUploader(specification, args).upload(compiled).catch((e) => Promise.reject(e)) as Serial;
                // return new Arduino(connection as Serial);
            case PlatformType.emulator:
                return await this.uploaderFactory.pickUploader(specification, args).upload(compiled).catch((e) => Promise.reject(e));
                // return new Emulator(connection as SubProcess);
            // case PlatformType.oop:
            //     let spec: OutofPlaceSpecification = specification as OutofPlaceSpecification;
            //     connection = await this.uploaderFactory.pickUploader({type: PlatformType.emulator, options: spec.options}, args).upload(compiled).catch((e) => Promise.reject(e));
            //     return new Oop(connection as SubProcess, await this.initialize(spec.proxy, program, args));
            default:
                return Promise.reject('Platform not implemented.');
        }
    }
}
