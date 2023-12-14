export enum PlatformType {
    arduino,
    emulator,
}

export interface ConnectionOptions {
}

export interface SerialOptions extends ConnectionOptions {
    path: string,
    fqbn: string,
    baudRate: number
}


export interface SubprocessOptions extends ConnectionOptions {
    port: number
}


export interface PlatformSpecification {
    readonly type: PlatformType;
    readonly options: ConnectionOptions;
}

export class EmulatorSpecification implements PlatformSpecification {
    public readonly type: PlatformType;
    public readonly options: SubprocessOptions;

    constructor(port: number) {
        this.type = PlatformType.emulator;
        this.options = {port: port};
    }
}

export class SerialSpecification implements PlatformSpecification {
    public readonly type: PlatformType;
    public readonly options: SerialOptions;

    constructor(path?: string, fqbn?: string, baudRate?: number) {
        this.type = PlatformType.emulator;
        this.options = {
            path: path ?? '/dev/ttyUSB0',
            fqbn: fqbn ?? 'esp32:esp32:esp32wrover',
            baudRate: baudRate ?? 115200,
        };
    }
}
