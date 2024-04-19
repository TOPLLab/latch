export enum PlatformType {
    arduino,
    emulator,
    // oop
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


export interface TesteeSpecification {
    readonly type: PlatformType;
    readonly options: ConnectionOptions;
    readonly proxy?: TesteeSpecification;
}

export class EmulatorSpecification implements TesteeSpecification {
    public readonly type: PlatformType;
    public readonly options: SubprocessOptions;

    constructor(port: number) {
        this.type = PlatformType.emulator;
        this.options = {port: port};
    }
}

// class OutofPlaceSpecification implements TesteeSpecification {
//     public readonly type: PlatformType = PlatformType.oop;
//     public readonly options: ConnectionOptions;
//     public readonly proxy: EmulatorSpecification;
//
//     constructor(local: number, proxy: EmulatorSpecification) {
//         this.options = {port: local};
//         this.proxy = proxy;
//     }
// }

export class ArduinoSpecification implements TesteeSpecification {
    public readonly type: PlatformType;
    public readonly options: SerialOptions;

    constructor(path?: string, fqbn?: string, baudRate?: number) {
        this.type = PlatformType.arduino;
        this.options = {
            path: path ?? '/dev/ttyUSB0',
            fqbn: fqbn ?? 'esp32:esp32:esp32wrover',
            baudRate: baudRate ?? 115200,
        };
    }
}
