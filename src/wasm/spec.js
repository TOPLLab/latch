"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAsserts = exports.parseArguments = exports.parseResult = exports.typing = exports.Type = void 0;
/**
 * Specification test suite for WebAssembly.
 */
const fs_1 = require("fs");
// import {expect} from 'chai';
var Type;
(function (Type) {
    Type[Type["f32"] = 0] = "f32";
    Type[Type["f64"] = 1] = "f64";
    Type[Type["i32"] = 2] = "i32";
    Type[Type["i64"] = 3] = "i64";
    Type[Type["unknown"] = 4] = "unknown";
})(Type = exports.Type || (exports.Type = {}));
exports.typing = new Map([
    ['f32', Type.f32],
    ['f64', Type.f64],
    ['i32', Type.i32],
    ['i64', Type.i64]
]);
function parseResult(input) {
    let cursor = 0;
    let delta = consume(input, cursor, /\(/d);
    if (delta === 0) {
        return undefined;
    }
    cursor += delta;
    delta = consume(input, cursor, /^[^.)]*/d);
    const type = exports.typing.get(input.slice(cursor, cursor + delta)) ?? Type.i64;
    cursor += delta + consume(input, cursor + delta);
    let value;
    delta = consume(input, cursor, /^[^)]*/d);
    if (type === Type.f32 || type === Type.f64) {
        value = parseHexFloat(input.slice(cursor, cursor + delta));
    }
    else {
        value = parseInteger(input.slice(cursor, cursor + delta));
    }
    if (value === undefined) {
        return value;
    }
    return { type, value };
}
exports.parseResult = parseResult;
function parseArguments(input, index) {
    const args = [];
    let cursor = consume(input, 0, /invoke "[^"]+"/d);
    while (cursor < input.length) {
        let delta = consume(input, cursor, /^[^)]*\(/d);
        if (delta === 0) {
            break;
        }
        cursor += delta;
        delta = consume(input, cursor, /^[^.)]*/d);
        const type = exports.typing.get(input.slice(cursor + delta - 3, cursor + delta)) ?? Type.i64;
        cursor += delta + consume(input, cursor + delta, /^[^)]*const /d);
        delta = consume(input, cursor, /^[^)]*/d);
        let maybe;
        if (type === Type.f32 || type === Type.f64) {
            maybe = parseHexFloat(input.slice(cursor, cursor + delta));
        }
        else {
            maybe = parseInteger(input.slice(cursor, cursor + delta));
        }
        if (maybe !== undefined) {
            args.push({ type, value: maybe });
        }
        cursor += consume(input, cursor, /\)/d);
        if (input[cursor] === ')') {
            break;
        }
    }
    index.value = cursor;
    return args;
}
exports.parseArguments = parseArguments;
function consume(input, cursor, regex = / /d) {
    const match = regex.exec(input.slice(cursor));
    // @ts-ignore
    return (match?.indices[0][1]) ?? 0;
}
function parseAsserts(file) {
    const asserts = [];
    (0, fs_1.readFileSync)(file).toString().split('\n').forEach((line) => {
        if (line.includes('(assert_return')) {
            asserts.push(line.replace(/.*\(assert_return\s*/, '('));
        }
    });
    return asserts;
}
exports.parseAsserts = parseAsserts;
// describe('Test Spec test generation', () => {
//     it('Consume token', async () => {
//         expect(consume('(f32.const 0x0p+0) (f32.const 0x0p+0)) (f32.const 0x0p+0)', 0)).to.equal(11);
//         expect(consume('(f32.const 0x0p+0) (f32.const 0x0p+0)) (f32.const 0x0p+0)', 11, /\)/d)).to.equal(7);
//         expect(consume('(f32.const 0x0p+0) (f32.const 0x0p+0)) (f32.const 0x0p+0)', 18, /\(/d)).to.equal(2);
//         expect(consume('(f32.const 0x0p+0) (f32.const 0x0p+0)) (f32.const 0x0p+0)', 30, /\)/d)).to.equal(7);
//     });
//
//     it('Parse arguments', async () => {
//         expect(parseArguments('(invoke "add" (f32.const 0x0p+0) (f32.const 0x0p+0)) (f32.const 0x0p+0)', {value: 0})).to.eql([
//             {type: Type.f32, value: 0}, {type: Type.f32, value: 0}]);
//         expect(parseArguments('(invoke "add" (f32.const 0x74p+0) (f32.const 0x5467p-3)) (f32.const 0x0p+0)', {value: 0})).to.eql([
//             {type: Type.f32, value: 116}, {type: Type.f32, value: 2700.875}]);
//         expect(parseArguments('( (invoke "add" (f32.const -0x0p+0) (f32.const -0x1p-1)) (f32.const -0x1p-1))', {value: 0})).to.eql([
//             {type: Type.f32, value: -0}, {type: Type.f32, value: -0.5}]);
//         // expect(parseArguments('(((((invoke "none" ( )))))))))))))) (f32.const 0x0p+0)', {value: 0})).to.eql([]);
//         expect(parseArguments('((invoke "f") (f64.const +0x0.0000000000001p-1022))', {value: 0})).to.eql([]);
//         expect(parseArguments('((invoke "as-br-value") (i32.const 1))', {value: 0})).to.eql([]);
//         expect(parseArguments('( (invoke "as-unary-operand") (f64.const 1.0))', {value: 0})).to.eql([]);
//     });
//
//     it('Parse result', async () => {
//         expect(parseResult(') (f32.const 0x0p+0)')).to.eql({type: Type.f32, value: 0});
//         expect(parseResult(') (f32.const 0xff4p+1)')).to.eql({type: Type.f32, value: 8168});
//         expect(parseResult(') (f64.const +0x0.0000000000001p-1022))')).to.eql({type: Type.f64, value: 5e-324});
//         expect(parseResult(') (f64.const 1.0))')).to.eql({type: Type.f64, value: 1});
//         expect(parseResult(') (f32.const 1.32))')).to.eql({type: Type.f32, value: 1.32});
//     });
// });
// describe('Test Spec test generation', () => {
//     it('Parse integer', async () => {
//         expect(parseInteger('0xffffffef', 4)).to.equal(-17);
//     });
// });
// Sign function that returns non-zero values
function sign(integer) {
    if (Object.is(integer, -0)) {
        return -1;
    }
    return Math.sign(integer) || 1;
}
function parseHexFloat(input) {
    if (input.includes('-inf')) {
        return -Infinity;
    }
    if (input.includes('inf')) {
        return Infinity;
    }
    const radix = input.includes('0x') ? 16 : 10;
    let base = input, mantissa, exponent = 0;
    const splitIndex = input.indexOf('p');
    if (splitIndex !== -1) {
        base = input.slice(0, splitIndex);
        exponent = parseInt(input.slice(splitIndex + 1));
    }
    const dotIndex = base.indexOf('.');
    if (dotIndex !== -1) {
        const [integer, fractional] = base.split('.').map(hexStr => parseInt(hexStr, radix));
        const fraction = fractional / Math.pow(radix, base.length - dotIndex - 1);
        mantissa = sign(integer) * (Math.abs(integer) + fraction);
    }
    else {
        mantissa = parseInt(base, radix);
    }
    return mantissa * Math.pow(2, exponent);
}
function parseInteger(hex, bytes = 4) {
    if (!hex.includes('0x')) {
        return parseInt(hex);
    }
    const mask = parseInt('0x80' + '00'.repeat(bytes - 1), 16);
    let integer = parseInt(hex, 16);
    if (integer >= mask) {
        integer = integer - mask * 2;
    }
    return integer;
}
// describe('Test Parse Float', () => {
//     it('Radix 16', async () => {
//         expect(parseHexFloat('-0x0p+0\n')).to.equal(0);
//         expect(parseHexFloat('0x1.000002p-3\n')).to.equal(0.1250000149011612);
//         expect(parseHexFloat('0x4')).to.equal(4);
//         expect(parseHexFloat('0x445')).to.equal(1093);
//         expect(parseHexFloat('0x1p-149')).to.equal(1.401298464324817e-45);
//         expect(Math.round((parseHexFloat('-0x1.921fb6p+2') ?? NaN) * 10000) / 10000).to.equal(-6.2832);
//         expect(parseHexFloat('-0x1.fffffffffffffp+1023')).to.equal(-1.7976931348623157e+308);
//         expect(parseHexFloat('-0x1.8330077d90a07p+476')).to.equal(-2.9509335293656034e+143);
//         expect(parseHexFloat('-0x1.e251d762163ccp+825')).to.equal(-4.215425823442686e+248);
//         expect(parseHexFloat('0x1.3ee63581e1796p+349')).to.equal(1.4285058546706491e+105);
//     });
// });
//# sourceMappingURL=spec.js.map