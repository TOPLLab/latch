import {Framework} from './framework/Framework';

export * from './manage/Compiler';
export * from './manage/Uploader';
export * from './util/deps';
export {PlatformType} from './testee/PlatformFactory';
export * from './framework/tests/Actions';
export * from './framework/Describer';
export * from './framework/Framework';
export * from './messaging/Parsers';
export * from './messaging/Message';
export * from './framework/Scheduler';
export * from './sourcemap/Wasm';

export const latch = Framework.getImplementation();
export {Step} from './framework/tests/Step';
export {Invoker} from './framework/tests/Invoker';
export {TestScenario} from './framework/tests/TestScenario';