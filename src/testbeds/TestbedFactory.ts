import {Testbed} from './Testbed';
import {ARDUINO, EMULATOR, WABT} from '../util/env';
import {CompileOutput, CompilerFactory} from '../manage/Compiler';
import {DummyProxy, Emulator} from './Emulator';
import {UploaderFactory} from '../manage/Uploader';
import {Connection} from '../bridge/Connection';
import {Arduino} from './Arduino';
import {Serial} from '../bridge/Serial';
import {SubProcess} from '../bridge/SubProcess';
import {PlatformType, ProxySpecification, TestbedSpecification} from './TestbedSpecification';

export class TestbedFactory {
    public readonly timeout: number;
    private readonly compilerFactory: CompilerFactory;
    private readonly uploaderFactory: UploaderFactory;

    constructor(timeout: number) {
        this.timeout = timeout;
        this.compilerFactory = new CompilerFactory(WABT);
        this.uploaderFactory = new UploaderFactory(EMULATOR, ARDUINO);
    }

    public async initialize(specification: TestbedSpecification, program: string, args: string[]): Promise<Testbed> {
        let compiled: CompileOutput = await this.compilerFactory.pickCompiler(program).compile(program).catch((e) => Promise.reject(e));
        let connection: Connection = await this.uploaderFactory.pickUploader(specification, args).upload(compiled).catch((e) => Promise.reject(e));

        switch (specification.type) {
            case PlatformType.arduino:
                return new Arduino(connection as Serial);
            case PlatformType.emulator:
            case PlatformType.emu2emu:
            case PlatformType.debug:
                return new Emulator(connection as SubProcess);
            case PlatformType.emuproxy:
                const dummy = new DummyProxy(connection as SubProcess);
                await dummy.init(specification as ProxySpecification);
                return dummy;
            default:
                return Promise.reject('Platform not implemented.');
        }
    }
}
