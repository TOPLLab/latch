import {ChildProcess, exec, spawn} from 'child_process';
import {ReadlineParser, SerialPort, SerialPortOpenOptions} from 'serialport';
import {Readable} from 'stream';
import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';
import {EventEmitter} from 'events';
import {SubProcess} from '../bridge/SubProcess';
import {Connection} from '../bridge/Connection';
import {Serial} from '../bridge/Serial';
import {CompileOutput} from './Compiler';
import {PlatformType, SerialOptions, SubprocessOptions, TestbedSpecification} from '../testbeds/TestbedSpecification';

enum UploaderEvents {
    compiled = 'compiled',
    compiling = 'compiling',
    connected = 'connected',
    connecting = 'connecting',
    failed = 'failed',
    flashing = 'flashing',
    staging = 'staging',
    started = 'started',
    uploaded = 'uploaded',
    uploading = 'uploading',
}

export class UploaderFactory {
    private readonly emulator: string;
    private readonly arduino: string;

    constructor(emulator: string, arduino: string) {
        this.emulator = emulator;
        this.arduino = arduino;
    }

    public pickUploader(specification: TestbedSpecification, args: string[] = []): Uploader {
        switch (specification.type) {
            case PlatformType.arduino:
                return new ArduinoUploader(this.arduino, args, specification.options as SerialOptions);
            case PlatformType.emulator:
            case PlatformType.emu2emu:
            case PlatformType.emuproxy:
                return new EmulatorUploader(this.emulator, args, specification.options as SubprocessOptions);
            case PlatformType.debug:
                return new EmulatorConnector(specification.options as SubprocessOptions)
        }
        throw new Error('Unsupported platform type');
    }
}


export abstract class Uploader extends EventEmitter {
    abstract upload(compiled: CompileOutput): Promise<Connection>;

    protected removeTmpDir(tmpdir: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.rm(tmpdir, {recursive: true}, err => {
                if (err) {
                    reject('Could not delete temporary directory.');
                    return;
                }
                resolve();
            });
        });
    }
}

function isReadable(x: Readable | null): x is Readable {
    return x !== null;
}

export class EmulatorConnector extends Uploader {
    private readonly port: number;

    constructor(options: SubprocessOptions) {
        super();
        this.port = options.port;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upload(compiled: CompileOutput, listener?: (chunk: any) => void): Promise<SubProcess> {
        return this.connectSocket(compiled.file, listener);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private connectSocket(program: string, listener?: (chunk: any) => void): Promise<SubProcess> {
        return new Promise((resolve, _reject) => {
            const client = new net.Socket();
            client.connect(this.port, () => {
                this.emit(UploaderEvents.connected);
                if (listener !== undefined) {
                    client.on('data', listener);
                }
                resolve(new SubProcess(client));
            });
        });
    }
}

export class EmulatorUploader extends Uploader {
    private readonly interpreter: string;
    private readonly args: string[];
    private readonly port: number;

    constructor(interpreter: string, args: string[] = [], options: SubprocessOptions) {
        super();
        this.interpreter = interpreter;
        this.port = options.port;
        this.args = args;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upload(compiled: CompileOutput, listener?: (chunk: any) => void): Promise<SubProcess> {
        return this.connectSocket(compiled.file, listener);
    }

    private startWARDuino(program: string): ChildProcess {
        const _args: string[] = [program, '--paused', '--socket', (this.port).toString()].concat(this.args);
        return spawn(this.interpreter, _args);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private connectSocket(program: string, listener?: (chunk: any) => void): Promise<SubProcess> {
        const process = this.startWARDuino(program);

        return new Promise((resolve, reject) => {
            if (process === undefined) {
                reject('Failed to start process.');
            }

            this.emit(UploaderEvents.started);

            while (process.stdout === undefined) {
                // wait for stdout to become available
            }

            if (isReadable(process.stdout)) {
                let error: string = '';

                const reader = new ReadlineParser();
                process.stdout.pipe(reader);

                reader.on('data', (data) => {
                    if (listener !== undefined) {
                        listener(data);
                    }

                    this.emit(UploaderEvents.connecting);

                    if (data.includes('Listening')) {
                        const client = new net.Socket();
                        client.connect(this.port, () => {
                            this.emit(UploaderEvents.connected);
                            if (listener !== undefined) {
                                client.on('data', listener);
                            }
                            resolve(new SubProcess(client, process));
                        });
                    } else {
                        error = data.toString();
                    }
                });

                reader.on('error', (err: Error) => {
                    error = err.message;
                });

                reader.on('close', () => {
                    this.emit(UploaderEvents.failed);
                    reject(`Could not connect. Error:  ${error}`);
                });
            } else {
                this.emit(UploaderEvents.failed);
                reject();
            }
        });
    }
}

export class ArduinoUploader extends Uploader {
    private readonly sdkpath: string;
    private readonly fqbn: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly options: SerialPortOpenOptions<any>;

    constructor(sdkpath: string, _args: string[] = [], options: SerialOptions) {
        super();
        this.sdkpath = sdkpath;
        this.fqbn = options.fqbn;
        this.options = {
            path: options.path,
            baudRate: options.baudRate
        };
    }

    public upload(compiled: CompileOutput): Promise<Serial> {
        this.emit(UploaderEvents.staging);
        return this.stage(compiled.file).then(() => {
            return this.removeTmpDir(path.dirname(compiled.file));
        }).then(() => {
            this.emit(UploaderEvents.flashing);
            return this.flash();
        }).then(() => {
            this.emit(UploaderEvents.connecting);
            return this.connect();
        });
    }

    private stage(program: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const compile = exec(`make compile PAUSED=true BINARY=${program}`, {cwd: this.sdkpath});

            compile.on('close', (code) => {
                if (code !== 0) {
                    this.emit(UploaderEvents.failed);
                    reject('staging failed: unable to build Arduino program');
                    return;
                }
                resolve();
            });
        });
    }

    private flash(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const command = `make flash PORT=${this.options.path} FQBN=${this.fqbn}`;

            const upload = exec(command, {cwd: this.sdkpath});

            upload.on('close', (code) => {
                if (code !== 0) {
                    this.emit(UploaderEvents.failed);
                    reject(`unable to flash program to ${this.fqbn}`);
                    return;
                }
                resolve();
            });
        });
    }

    private connect(): Promise<Serial> {
        return new Promise<Serial>((resolve, reject) => {
            const channel = new SerialPort(this.options,
                (error) => {
                    if (error) {
                        this.emit(UploaderEvents.failed);
                        reject(`could not connect to serial port: ${this.options.path}`);
                        return;
                    }
                }
            );
            this.emit(UploaderEvents.connected);
            resolve(new Serial(channel));
        });
    }
}
