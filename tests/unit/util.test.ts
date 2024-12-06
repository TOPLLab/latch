import test from 'ava';
import {getFileExtension} from '../../src/util/util';

test('[internal] test util/getFileExtension', t => {
    t.is(getFileExtension('test.wast'), 'wast');
    t.is(getFileExtension('util.test.js'), 'js');
    t.is(getFileExtension('float_misc.asserts.wast'), 'wast');
    t.is(getFileExtension('simd_i16x8_extadd_pairwise_i8x16.wast'), 'wast');
});
