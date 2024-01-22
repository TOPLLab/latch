#!/usr/bin/env node

'use strict';

/**
 * Executable for running Latch test suites.
 *
 * @module bin/latch
 * @private
 */
const {spawn} = require('child_process');

const args = ['--exit', '--color', '--reporter', `${require('path').dirname(__dirname)}/dist/cjs/framework/MochaReporter.cjs`, '--loader=ts-node/esm', '--experimental-specifier-resolution=node', '--require', 'ts-node/register', '--ui', 'bdd' ].concat(process.argv.slice(2));
const proc = spawn('mocha', args, {
    stdio: 'inherit'
});

proc.on('exit', (code, signal) => {
    process.on('exit', () => {
        if (signal) {
            process.kill(process.pid, signal);
        } else {
            process.exit(code);
        }
    });
});

// terminate children.
process.on('SIGINT', () => {
    // XXX: a previous comment said this would abort the runner, but I can't see that it does
    // anything with the default runner.
    debug('main process caught SIGINT');
    proc.kill('SIGINT');
    // if running in parallel mode, we will have a proper SIGINT handler, so the below won't
    // be needed.
    if (!args.parallel || args.jobs < 2) {
        // win32 does not support SIGTERM, so use next best thing.
        if (require('os').platform() === 'win32') {
            proc.kill('SIGKILL');
        } else {
            // using SIGKILL won't cleanly close the output streams, which can result
            // in cut-off text or a befouled terminal.
            debug('sending SIGTERM to child process');
            proc.kill('SIGTERM');
        }
    }
});
