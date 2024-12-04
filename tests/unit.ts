import test from 'ava';
import {getFileExtension} from '../src/util/util';

test('[internal] test util/getFileExtension', t => {
    t.is(getFileExtension('test.wast'), 'wast');
});

test('[warduino] start emulator', t => {
    t.pass();
});

test('[warduino] start oop testbed', t => {
    t.pass();
});

test('[dummy] start dummy testbed', t => {
    t.pass();
});

test('[dummy] simple passing test', t => {
    t.pass();
});

test('[dummy] simple failing test', t => {
    t.pass();
});

test('[dummy] general info reporter', t => {
    t.pass();
});

test('[dummy] overview in reporter', t => {
    t.pass();
});

test('[dummy] failing count', t => {
    t.pass();
});

test('[dummy] passing count', t => {
    t.pass();
});

test('[dummy] log file create', t => {
    t.pass();
});

test('[dummy] log file correct', t => {
    t.pass();
});

