import {Describer} from './Describer';
import {HybridScheduler, Scheduler} from './Scheduler';
import {TestScenario} from './scenario/TestScenario';

import {PlatformSpecification, PlatformType} from '../testee/PlatformSpecification';

export interface TestBed {
    name: string;

    describer: Describer;

    scheduler: Scheduler;

    disabled: boolean;
}

export interface Suite {
    title: string;
    tests: TestScenario[];
}

interface DependenceTree {
    test: TestScenario;
    children: DependenceTree[];
}

export class Framework {
    private static implementation: Framework;

    private beds: TestBed[] = [];
    private suites: Suite[] = [];

    public runs: number = 1;

    private constructor() {
    }

    private currentSuite(): Suite {
        return this.suites[this.suites.length - 1];
    }

    public testbed(name: string, specification: PlatformSpecification, scheduler: Scheduler = new HybridScheduler(), disabled: boolean = false) {
        const describer = new Describer(specification);
        if (disabled) {
            describer.skipall();
        }

        this.beds.push({
            name: name,
            describer: describer,
            disabled: disabled,
            scheduler: scheduler
        });
    }

    public platforms(): TestBed[] {
        return this.beds;
    }

    public suite(title: string) {
        this.suites.push({title: title, tests: []});
    }

    public test(test: TestScenario) {
        this.currentSuite().tests.push(test);
    }

    public tests(tests: TestScenario[]) {
        tests.forEach(test => this.currentSuite().tests.push(test));
    }

    public run(cores: number = 1) {   // todo remove cores
        this.suites.forEach((suite: Suite) => {
            this.beds.forEach((bed: TestBed) => {
                describe(`Setting up ${bed.name}.`, () => {
                    // todo add parallelism
                    const order: TestScenario[] = bed.scheduler.schedule(suite);

                    // if (!bed.disabled) { // TODO necessary? isn't this done in de test itself?
                    //     before('Connect to debugger', async function () {
                    //         this.timeout(bed.describer.connector.connectionTimeout * 1.1);
                    //
                    //         bed.describer.instance = await bed.describer.connector.connect();  // todo move createInstance to Framework?
                    //     });
                    //
                    //     after('Shutdown debugger', async function () {
                    //         if (bed.describer.instance) {
                    //             await bed.connection.kill();
                    //         }
                    //     });
                    // }

                    order.forEach((test: TestScenario) => {
                        bed.describer.describeTest(test, this.runs);
                    });
                });
            });
        });
    }

    // Analyse flakiness
    public analyse(runs: number = 3, cores: number = 1) {
        this.runs = runs;
        this.run(cores);
    }

    public static getImplementation() {
        if (!Framework.implementation) {
            Framework.implementation = new Framework();
        }

        return Framework.implementation;
    }
}