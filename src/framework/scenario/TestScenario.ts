import { Breakpoint } from "../../debug/Breakpoint";
import { CompilerOptions } from "../../manage/Compiler";
import { Step } from "./Step";

/** A series of scenario to perform on a single instance of the vm */
export interface TestScenario {
    title: string;

    /** File to load into the interpreter */
    program: string;

    /** Initial breakpoints */
    initialBreakpoints?: Breakpoint[];

    /** Arguments for the interpreter */
    args?: string[];

    steps?: Step[];

    skip?: boolean;

    dependencies?: TestScenario[];

    compilerOptions?: CompilerOptions;
}