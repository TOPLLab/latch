import test from 'ava';
import {find, getFileExtension} from '../../src/util/util';
import {indent} from '../../src/util/printing';
import {retry} from '../../src/util/retry';

test('[getFileExtension] : test core functionality', t => {
    t.is(getFileExtension('test.wast'), 'wast');
    t.is(getFileExtension('util.test.js'), 'js');
    t.is(getFileExtension('float_misc.asserts.wast'), 'wast');
    t.is(getFileExtension('simd_i16x8_extadd_pairwise_i8x16.wast'), 'wast');
});

test('[getFileExtension] : test error throwing', t => {
    const error = t.throws(() => {
        getFileExtension('impossible')
    }, {instanceOf: Error});
    t.is(error.message, 'Could not determine file type');
});

test('[find] : test core functionality', t => {
    t.is(find(/(wast)/, 'test.wast'), 'wast');
    t.is(find(/(.wast)/, 'impossible'), '');
    t.is(find(/—(.*)—/, 'Jeeves—my man, you know—is really a most extraordinary chap.'), 'my man, you know');
    t.is(find(/^(?:[^,]*,){2}\s*([a-zA-Z]+)/, 'liberty, equality, fraternity'), 'fraternity');
    t.is(find(/^(?:[^,]*,){2}\s*([a-zA-Z]+)/, 'The unanimous Declaration of the thirteen united States of America, When in the Course of human events, it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth, the separate and equal station to which the Laws of Nature and of Nature\'s God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation.'), 'it');
    t.is(find(/([a-zA-Z]{11,})/, 'The unanimous Declaration of the thirteen united States of America, When in the Course of human events, it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth, the separate and equal station to which the Laws of Nature and of Nature\'s God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation.'), 'Declaration');
});

test('[indent] : test printing', t => {
    t.is(indent(4), '        ');
    t.is(indent(4, 1), '    ');
    t.is(indent(1, 4), '    ');
});

const attempt = (count: number, n: number) => retry(async () => {
    return new Promise<number>((resolve, reject) => {
        count--;
        if (count === 0) {
            resolve(0);
        } else {
            reject()
        }
    })
}, n);

test('[retry] : test core functionality', async t => {
    t.is(await attempt(2, 2), 0);
    t.is(await attempt(2, 4), 0);
    t.is(await attempt(8, 9), 0);
});

test('[retry] : test error throwing', async t => {
    const error = await t.throwsAsync(attempt(2, 1));
    t.is(error.message, `exhausted number of retries (${1})`);
});