export declare enum Type {
    f32 = 0,
    f64 = 1,
    i32 = 2,
    i64 = 3,
    unknown = 4
}
export declare const typing: Map<string, Type>;
export interface Value {
    type: Type;
    value: number;
}
interface Cursor {
    value: number;
}
export declare function parseResult(input: string): Value | undefined;
export declare function parseArguments(input: string, index: Cursor): Value[];
export declare function parseAsserts(file: string): string[];
export {};
