export enum PlatformType {
    arduino,
    emulator,
    emu2emu,
    debug
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

export interface SupervisorOptions extends ConnectionOptions {
    port: number,
    proxy: number
}

export interface TestbedSpecification {
    readonly type: PlatformType;
    readonly options: ConnectionOptions;
}

export class OutofPlaceSpecification implements TestbedSpecification {
    public readonly type: PlatformType = PlatformType.emu2emu;
    public readonly options: SupervisorOptions;

    public readonly proxy: EmulatorSpecification;

    constructor(supervisor: number, proxy: number) {
        this.options = {port: supervisor, proxy: proxy};
        this.proxy = new EmulatorSpecification(proxy);
    }
}

export class EmulatorSpecification implements TestbedSpecification {
    public readonly type: PlatformType;
    public readonly options: SubprocessOptions;

    constructor(port: number, type: PlatformType = PlatformType.emulator) {
        this.type = type;
        this.options = {port: port};
    }
}

export class ArduinoSpecification implements TestbedSpecification {
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
