export const WABT: string = process.env.WABT ?? '';

export const EMULATOR: string = process.env.EMULATOR ?? `${require('os').homedir()}/Arduino/libraries/WARDuino/build-emu/wdcli`;
