import {Framework} from "./framework/Framework";

export * from './bridges/Compiler';
export * from './bridges/Uploader';
export * from './bridges/WARDuino';
export * from './language/Actions';
export * from './language/Describer';
export * from './framework/Framework';
export * from './parsers/Parsers';
export * from './language/Scheduler';
export * from './wasm/spec';

export const latch = Framework.getImplementation();
