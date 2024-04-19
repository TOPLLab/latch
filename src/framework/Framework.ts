import {OutOfPlaceTestBed, SingleDeviceTestBed, TestBed} from './Testbed';
import {HybridScheduler, Scheduler} from './Scheduler';
import {TestScenario} from './scenario/TestScenario';

import {TesteeSpecification} from '../testbeds/TesteeSpecification';
import {Testee} from '../testbeds/Testee';

export interface Suite {
    title: string;
    scenarios(): TestScenario[];
    testees: TestBed[];
}

interface DependenceTree {
    test: TestScenario;
    children: DependenceTree[];
}

export interface TesteeOptions {
    disabled?: boolean;
    timeout?: number;
    connectionTimout?: number;
}

export enum OutputStyle {
    silent, // TODO
    plain,
    github
}


export class IndividualSuite implements Suite {
    public title: string;
    public testScenarios: TestScenario[] = [];
    public testees: TestBed[] = [];

    public constructor(title: string) {
        this.title = title;
    }

    public testee(name: string, specification: TesteeSpecification, scheduler: Scheduler = new HybridScheduler(), options: TesteeOptions = {}): void {
        const testee = new SingleDeviceTestBed(name, specification, scheduler, options.timeout ?? 2000, options.connectionTimout ?? 5000);
        if (options.disabled) {
            testee.skipall();
        }

        this.testees.push(testee);
    }

    public test(test: TestScenario) {
        this.testScenarios.push(test);
    }

    public tests(tests: TestScenario[]) {
        tests.forEach(test => this.testScenarios.push(test));
    }

    public scenarios(): TestScenario[] {
        return this.testScenarios;
    }
}

export class OopSuite implements Suite {
    public title: string;
    public testScenarios: ((testee: Testee, proxy: Testee) => TestScenario)[] = [];
    public testees: OutOfPlaceTestBed[] = [];

    public constructor(title: string) {
        this.title = title;
    }

    public testbed(name: string, testee: TesteeSpecification, proxy: TesteeSpecification, scheduler: Scheduler = new HybridScheduler(), options: TesteeOptions = {}): void {
        const testbed: OutOfPlaceTestBed = new OutOfPlaceTestBed(name, testee, proxy, scheduler, options.timeout ?? 2000, options.connectionTimout ?? 5000);
        if (options.disabled) {
            testbed.skipall();
        }

        this.testees.push(testbed);
    }

    public test(test: (testee: Testee, proxy: Testee) => TestScenario) {
        this.testScenarios.push(test);
    }

    public scenarios(): TestScenario[] {
        return this.testees.flatMap((bed) => this.testScenarios.flatMap((sc) => sc(bed.testee, bed.proxy)))  // todo testees aren't initialized yet
    }

    public tests(tests: ((testee: Testee, proxy: Testee) => TestScenario)[]) {
        tests.forEach(test => this.testScenarios.push(test));
    }
}

export class Framework {
    private static implementation: Framework;

    public runs: number = 1;

    private outputStyle: OutputStyle = OutputStyle.plain;

    private scheduled: Suite[] = [];

    private constructor() {
    }

    public single = {
        suite(title: string): IndividualSuite {
            return new IndividualSuite(title);
        }
    }

    public oop = {
        suite(title: string): OopSuite {
            return new OopSuite(title);
        }
    }

    public suites(): Suite[] {
        return this.scheduled;
    }

    public style(style: OutputStyle): void {
        this.outputStyle = style;
    }

    public styling(): OutputStyle {
        return this.outputStyle;
    }

    public run(suites: Suite[], cores: number = 1) {   // todo remove cores
        this.scheduled.concat(suites);
        suites.forEach((suite: Suite) => {
            suite.testees.forEach((testee: TestBed) => {
                const order: TestScenario[] = testee.scheduler.schedule(suite);
                const first: TestScenario = order[0];
                before('Initialize testbed', async function () {
                    this.timeout(testee.timeout);
                    await testee.initialize(first.program, first.args ?? []).catch((e) => Promise.reject(e));
                });

                describe(`${testee.name}: ${suite.title}`, () => {
                    // todo add parallelism

                    // if (!bed.disabled) { // TODO necessary? isn't this done in de test itself?
                    //
                    //     after('Shutdown debugger', async function () {
                    //         if (bed.describer.instance) {
                    //             await bed.connection.kill();
                    //         }
                    //     });
                    // }

                    order.forEach((test: TestScenario) => {
                        testee.describe(test, this.runs);
                    });
                });

                after('Shutdown testbed', async function () {
                    await testee.shutdown();
                });
            });
        });
    }

    // Analyse flakiness
    public analyse(suite: Suite[], runs: number = 3, cores: number = 1) {
        this.runs = runs;
        this.run(suite, cores);
    }

    public static getImplementation() {
        if (!Framework.implementation) {
            Framework.implementation = new Framework();
        }

        return Framework.implementation;
    }
}