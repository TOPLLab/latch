import test from 'ava';
import {prefix, renderTreeLines, TreeNode} from '../../src/reporter/ink/Tree';

test('tree prefix renders ancestor continuations', t => {
    t.is(prefix([], true), '└─ ');
    t.is(prefix([], false), '├─ ');
    t.is(prefix([false], true), '│  └─ ');
    t.is(prefix([false], false), '│  ├─ ');
    t.is(prefix([true], true), '   └─ ');
});

test('renderTreeLines renders one failed scenario', t => {
    const tree: TreeNode<string> = {
        label: 'FAIL Test Debugger interface',
        children: [{
            label: 'Test DUMP blink',
            children: [{label: 'ERROR Send DUMP command'}]
        }]
    };

    t.deepEqual(renderTreeLines(tree), [
        'FAIL Test Debugger interface',
        '   └─ Test DUMP blink',
        '      └─ ERROR Send DUMP command'
    ]);
});

test('renderTreeLines renders multiple failed scenarios', t => {
    const tree: TreeNode<string> = {
        label: 'FAIL Test Debugger interface',
        children: [{
            label: 'Test STEP OVER',
            children: [{label: 'ERROR Check execution'}]
        }, {
            label: 'Test DUMP blink',
            children: [{label: 'ERROR Send DUMP command'}]
        }]
    };

    t.deepEqual(renderTreeLines(tree), [
        'FAIL Test Debugger interface',
        '   ├─ Test STEP OVER',
        '   │  └─ ERROR Check execution',
        '   └─ Test DUMP blink',
        '      └─ ERROR Send DUMP command'
    ]);
});

test('renderTreeLines renders multiple failed actions', t => {
    const tree: TreeNode<string> = {
        label: 'FAIL Test Debugger interface',
        children: [{
            label: 'Test DUMP blink',
            children: [
                {label: 'ERROR Send DUMP command'},
                {label: 'ERROR Check state'},
                {label: 'ERROR Check memory'}
            ]
        }]
    };

    t.deepEqual(renderTreeLines(tree), [
        'FAIL Test Debugger interface',
        '   └─ Test DUMP blink',
        '      ├─ ERROR Send DUMP command',
        '      ├─ ERROR Check state',
        '      └─ ERROR Check memory'
    ]);
});
