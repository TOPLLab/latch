#!/usr/bin/env node

const {resolve} = require('node:path');

const [testFile, ...testArguments] = process.argv.slice(2);

if (!testFile || testFile === '--help' || testFile === '-h') {
    const output = testFile ? console.log : console.error;
    output('Usage: latch <test-file.ts> [arguments]');
    process.exitCode = testFile ? 0 : 1;
} else {
    process.argv = [process.argv[0], resolve(testFile), ...testArguments];
    require('ts-node/register/transpile-only');
    require(process.argv[1]);
}
