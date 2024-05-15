import {Suite} from './Framework';
import {TestScenario} from './scenario/TestScenario';
import {Test} from 'mocha';

export abstract class Scheduler {
    public abstract readonly identifier: string;

    // sort the scenario into an efficient sequential schedule
    abstract sequential(suite: Suite): TestScenario[];

    // sort the scenario into an efficient schedule for parallel execution
    abstract parallel(suite: Suite, cores: number): TestScenario[][];
}

export class NoScheduler implements Scheduler {
    identifier = 'no schedule';

    public sequential(suite: Suite): TestScenario[] {
        return suite.scenarios;
    }

    public parallel(suite: Suite): TestScenario[][] {
        return [suite.scenarios];
    }
}

class SimpleScheduler implements Scheduler {
    identifier = 'sort on program';

    public sequential(suite: Suite): TestScenario[] {
        // flatten forest
        return this.parallel(suite).flat(2);
    }

    public parallel(suite: Suite): TestScenario[][] {
        // get trees
        const forest = trees(suite.scenarios);
        // sort trees by program
        return forest.map(tree => tree.flat().sort((a: TestScenario, b: TestScenario) => a.program.localeCompare(b.program)));
    }
}

/*
 * The Hybrid Scheduler respects dependency trees while minimising the need to change programs.
 *
 * The schedule iterates breadth-first over each tree in succession,
 * at each depth the scenario are sorted alphabetically according to their program.
 */
export class HybridScheduler implements Scheduler {
    identifier = 'hybrid schedule';

    public sequential(suite: Suite): TestScenario[] {
        let scheme: TestScenario[] = [];
        const forest: TestScenario[][][] = trees(suite.scenarios);
        for (const tree of forest) {
            tree.forEach(level => level.sort(sortOnProgram));
            scheme = scheme.concat(tree.flat(2));
        }
        return scheme.reverse();
    }

    public parallel(suite: Suite): TestScenario[][] {
        const scheme: TestScenario[][] = [];
        const forest: TestScenario[][][] = trees(suite.scenarios);
        for (const tree of forest) {
            tree.forEach(level => level.sort(sortOnProgram));
            for (let i = 0; i < tree.length; i++) {
                scheme[i] = tree[i];
            }
        }
        return scheme;
    }
}

export class DependenceScheduler implements Scheduler {
    identifier = 'dependence-prioritizing schedule';

    public sequential(suite: Suite): TestScenario[] {
        // flatten forest
        return this.parallel(suite).flat(2);
    }

    public parallel(suite: Suite): TestScenario[][] {
        const forest: TestScenario[][][] = trees(suite.scenarios);
        return forest.map(tree => tree.reverse().map(level => level.sort(sortOnProgram)).flat()).reverse();
    }
}

/* Util functions */

function sortOnProgram(a: TestScenario, b: TestScenario) {
    // aggregate scenario with the same program
    return a.program.localeCompare(b.program);
}

// aggregate dependence forest into trees
function trees(input: TestScenario[]): TestScenario[][][] {
    // sort input
    input.sort(comparator);

    // output
    let forest: TestScenario[][][] = [];

    // scenario that have already been seen
    const seen = new Set<TestScenario>();

    // loop over all scenario of the input
    let pointer = 0;
    for (const test of input) {
        if (seen.has(test)) {
            // test already in forest, nothing to do
            continue;
        }
        // start a new tree
        let t: TestScenario[][] = tree(test);
        forest.push(t);
        pointer = forest.length - 1;

        // add all tests to seen
        for (const s of t.flat()) {
            if (seen.has(s)) {
                // fold tree into forest
                const k = forest.findIndex((tree) => tree.some((l) => l.includes(s)));
                if (k < 0) {
                    continue;
                }
                if (k !== pointer) {
                    forest[k] = merge(forest[pointer], forest[k]);
                    forest[pointer] = [];
                    pointer = k;
                }
            } else {
                seen.add(s);
            }
        }
    }

    return forest.filter((t) => t.length > 0);
}

function tree(root: TestScenario): TestScenario[][] {
    let result: TestScenario[][] = [];

    let lifo: TestScenario[] = [...root.dependencies ?? []];
    for (const test of lifo) {
        const c = tree(test);
        result = merge(c, result);
    }

    result.unshift([root]);
    return result;
}

function merge(a: TestScenario[][], b: TestScenario[][]): TestScenario[][] {
    const seen = new Set<TestScenario>();

    const merged: Set<TestScenario>[] = [];
    const longest = (a.length > b.length ? a : b).reverse();
    const other = (a.length <= b.length ? a : b).reverse();
    for (const [i, tests] of longest.entries()) {
        merged.push(new Set());
        tests.forEach((t) => {
            if (!seen.has(t)) {
                seen.add(t);
                merged[i].add(t);
            }
        });
        if (i < other.length) {
            other[i].forEach((o) => {
                if (!seen.has(o)) {
                    seen.add(o);
                    merged[i].add(o);
                }
            });
        }
    }
    return merged.map((s) => Array.from(s)).reverse(); // a.map((l, i) => [...l, ...b[i] ?? []]);
}

function comparator(a: TestScenario, b: TestScenario): number {
    let comparison: number = (b.dependencies ?? []).length - (a.dependencies ?? []).length; // decreasing amount of dependencies
    if (comparison === 0) {
        comparison = sortOnProgram(a, b);
        if (comparison === 0) {
            comparison = a.title.localeCompare(b.title);
        }
    }
    return comparison;
}

// aggregate dependence forest into levels
function levels(input: TestScenario[]): TestScenario[][] {
    // input
    input.sort((a: TestScenario, b: TestScenario) => (a.dependencies ?? []).length - (b.dependencies ?? []).length);
    // output
    const levels: TestScenario[][] = [];

    // while more input remains
    while (input.length > 0) {
        const test: TestScenario = input.shift()!;

        // skip any test with unresolved dependencies
        let skip: boolean = (test.dependencies ?? []).some((dependence: TestScenario) => input.includes(dependence));

        if (skip) {
            input.push(test);
            break;
        }

        // add to level below
        const level: number = lowest(test, levels) + 1;
        if (levels[level] === undefined) {
            levels[level] = [];
        }
        levels[level].push(test);
    }

    return levels;
}

// get the lowest level of dependencies for a test
function lowest(test: TestScenario, levels: TestScenario[][]): number {
    for (let i = levels.length - 1; i >= 0; i--) {
        for (const level of levels[i] ?? []) {
            if (test.dependencies?.includes(level)) {
                return i;
            }
        }
    }
    return -1;
}