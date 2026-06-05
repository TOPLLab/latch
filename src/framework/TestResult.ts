import {randomUUID} from "node:crypto";

export enum Status {
    FAILED = 'failed',
    BROKEN = 'broken',
    PASSED = 'passed',
    SKIPPED = 'skipped',
}

export enum Stage {
    SCHEDULED = 'scheduled',
    RUNNING = 'running',
    FINISHED = 'finished',
    PENDING = 'pending',
    INTERRUPTED = 'interrupted',
}

export interface TestResult {
    uuid: string;
    historyId: string;
    status: Status | undefined;
    stage: Stage;
    fullName?: string;
    testCaseId?: string;
}

export const testResult = (): TestResult => {
    return {
        uuid: randomUUID().toString(),
        historyId: randomUUID().toString(),
        status: undefined,
        stage: Stage.PENDING,
    };
};