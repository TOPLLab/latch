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
import {
    PlatformType,
    SerialOptions,
    SubprocessOptions,
    TesteeSpecification
} from '../testbeds/TesteeSpecification';
import {Testee} from '../testbeds/Testee';

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

    public pickUploader(specification: TesteeSpecification, args: string[] = []): Uploader {
        switch (specification.type) {
            case PlatformType.arduino:
                return new ArduinoUploader(this.arduino, args, specification.options as SerialOptions);
            case PlatformType.emulator:
                return new EmulatorUploader(this.emulator, args, specification.options as SubprocessOptions);
        }
        throw new Error('Unsupported file type');
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

export class EmulatorUploader extends Uploader {
    protected readonly interpreter: string;
    protected readonly args: string[];
    protected readonly port: number;

    constructor(interpreter: string, args: string[] = [], options: SubprocessOptions) {
        super();
        this.interpreter = interpreter;
        this.port = options.port;
        this.args = args;
    }

    upload(compiled: CompileOutput, listener?: (chunk: any) => void): Promise<SubProcess> {
        return this.connectSocket(compiled.file, listener);
    }

    protected startWARDuino(program: string): ChildProcess {
        const _args: string[] = [program, '--paused', '--socket', (this.port).toString()].concat(this.args);
        return spawn(this.interpreter, _args);
    }

    private connectSocket(program: string, listener?: (chunk: any) => void): Promise<SubProcess> {
        const that = this;
        const process = this.startWARDuino(program);

        return new Promise(function (resolve, reject) {
            if (process === undefined) {
                reject('Failed to start process.');
            }

            that.emit(UploaderEvents.started);

            while (process.stdout === undefined) {
            }

            if (isReadable(process.stdout)) {
                let error: string = '';

                const reader = new ReadlineParser();
                process.stdout.pipe(reader);

                reader.on('data', (data) => {
                    if (listener !== undefined) {
                        listener(data);
                    }

                    that.emit(UploaderEvents.connecting);

                    if (data.includes('Listening')) {
                        const client = new net.Socket();
                        client.connect(that.port, () => {
                            that.emit(UploaderEvents.connected);
                            if (listener !== undefined) {
                                client.on('data', listener);
                            }
                            resolve(new SubProcess(that.port.toString(), client, process));
                        });
                    } else {
                        error = data.toString();
                    }
                });

                reader.on('error', (err: Error) => {
                    error = err.message;
                });

                reader.on('close', () => {
                    that.emit(UploaderEvents.failed);
                    reject(`Could not connect. Error:  ${error}`);
                });
            } else {
                that.emit(UploaderEvents.failed);
                reject();
            }
        });
    }
}

export class OopUploader extends EmulatorUploader {
    private proxy: Testee;

    constructor(interpreter: string, args: string[] = [], options: SubprocessOptions, proxy: Testee) {
        super(interpreter, args, options);
        this.proxy = proxy;
    }

    protected startWARDuino(program: string): ChildProcess {
        if (this.proxy.connection) {
            const _args: string[] = [program, '--paused', '--socket', (this.port).toString(), '--proxy', this.proxy.connection.address].concat(this.args);
            return spawn(this.interpreter, _args);
        }
        throw new Error('Starting supervisor: no proxy connection exists');
    }
}

export class ArduinoUploader extends Uploader {
    private readonly sdkpath: string;
    private readonly fqbn: string;
    private readonly options: SerialPortOpenOptions<any>;

    constructor(sdkpath: string, args: string[] = [], options: SerialOptions) {
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
        const that = this;
        return new Promise<void>((resolve, reject) => {
            const command = `xxd -i ${program} | sed -e 's/[^ ]*_wasm/upload_wasm/g' > ${this.sdkpath}/bin/upload.h`;

            let createHeaders = exec(command);

            createHeaders.on('close', (code) => {
                if (code !== 0) {
                    that.emit(UploaderEvents.failed);
                    reject('staging failed: unable to initialize headers');
                    return;
                }
                resolve();
            });
        }).then(() => {
            return new Promise<void>((resolve, reject) => {
                let compile = exec('make compile', {cwd: this.sdkpath});

                compile.on('close', (code) => {
                    if (code !== 0) {
                        that.emit(UploaderEvents.failed);
                        reject('staging failed: unable to build Arduino program');
                        return;
                    }
                    resolve();
                });
            });
        });
    }

    private flash(): Promise<void> {
        const that = this;
        return new Promise<void>((resolve, reject) => {
            const command = `make flash PORT=${this.options.path} FQBN=${this.fqbn}`;

            const upload = exec(command, {cwd: this.sdkpath});

            upload.on('close', (code) => {
                if (code !== 0) {
                    that.emit(UploaderEvents.failed);
                    reject(`unable to flash program to ${this.fqbn}`);
                    return;
                }
                resolve();
            });
        });
    }

    private connect(): Promise<Serial> {
        const that = this;
        return new Promise<Serial>((resolve, reject) => {
            const channel = new SerialPort(this.options,
                (error) => {
                    if (error) {
                        that.emit(UploaderEvents.failed);
                        reject(`could not connect to serial port: ${this.options.path}`);
                        return;
                    }
                }
            );
            channel.on('data', function (data) {
                if (data.toString().includes('LOADED')) {
                    channel.removeAllListeners('data');
                    that.emit(UploaderEvents.connected);
                    resolve(new Serial(that.options.path, channel));
                }
            });
        });
    }
}
