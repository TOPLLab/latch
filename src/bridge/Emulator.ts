import {Platform} from "./Platform";
import {ChildProcess} from "child_process";
import {SubProcess} from "./SubProcess";

export class Emulator extends Platform {
    readonly name: string = 'Emulator';

    private child: ChildProcess;

    constructor(medium: SubProcess) {
        super(medium.channel);
        this.child = medium.child;
    }

    kill(): Promise<void> {
        this.child.kill();
        return super.kill();
    }

}