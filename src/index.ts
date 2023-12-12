import {Framework} from "./framework/Framework";

export * from './bridges/Compiler';
export * from './bridges/Uploader';
export * from './bridges/WARDuino';
export * from './testing/Actions';
export * from './testing/Describer';
export * from './framework/Framework';
export * from './parsers/Parsers';
export * from './testing/Scheduler';
export * from './wasm/spec';

export const latch = Framework.getImplementation();
