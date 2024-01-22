import {homedir} from 'os';

export const WABT: string = process.env.WABT ?? '/home/tom/Documents/TOPL/plugin/WABT/build/';

export const EMULATOR: string = process.env.EMULATOR ?? `${homedir()}/Arduino/libraries/WARDuino/build-emu/wdcli`;

export const ARDUINO: string = `${homedir()}/Arduino/libraries/WARDuino/platforms/Arduino/`;
