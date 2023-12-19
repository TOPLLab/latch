import {WASM} from '../sourcemap/Wasm';

export namespace WARDuino {
    import Value = WASM.Value;
    import Frame = WASM.Frame;
    import Table = WASM.Table;
    import Memory = WASM.Memory;

    export interface CallbackMapping {
        callbackid: string;
        tableIndexes: number[]
    }

    export enum Interrupt {
        run = '01',
        halt = '02',
        pause = '03',
        step = '04',
        stepOver = '05',
        addBreakpoint = '06',
        removeBreakpoint = '07',
        inspect = '09',
        dump = '10',
        dumpLocals = '11',
        dumpAll = '12',
        reset = '13',
        updateStackValue = '14',
        updateGlobal = '15',
        updateFunction = '20',
        updateLocal = '21',
        updateModule = '22',
        invoke = '40',
        // Pull debugging messages
        snapshot = '60',
        offset = '61',
        loadSnapshot = '62',
        updateProxies = '63',
        proxyCall = '64',
        proxify = '65',
        // Push debugging messages
        dumpAllEvents = '70',
        dumpEvents = '71',
        popEvent = '72',
        pushEvent = '73',
        dumpCallbackmapping = '74',
        updateCallbackmapping = '75'
    }


    export interface InterruptEvent {
        topic: string;
        payload: string;
    }

    export interface BRTable {
        size: string;
        labels: number[];
    }

    // WARDuino VM State - format returned by inspect/dump requests
    export interface State {
        pc?: number;
        pc_error?: number;
        exception_msg?: string;
        breakpoints?: number[];
        stack?: Value[];
        callstack?: Frame[];
        globals?: Value[];
        table?: Table;
        memory?: Memory;
        br_table?: BRTable;
        callbacks?: CallbackMapping[];
        events?: InterruptEvent[];
    }
}