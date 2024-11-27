export enum PlatformType {
    arduino,
    emulator,
    emu2emu,
    emuproxy,
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

    public readonly proxy: ProxySpecification;

    constructor(supervisor: number, proxy: number, dummy: number = proxy + 1) {
        this.options = {port: supervisor, proxy: proxy};
        this.proxy = new ProxySpecification(proxy, dummy);
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

export class ProxySpecification extends EmulatorSpecification {
    public readonly dummy: SubprocessOptions;
    constructor(port: number, dummy: number) {
        super(port, PlatformType.emuproxy);
        this.dummy = {port: dummy};
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
