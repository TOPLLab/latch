class Comparable {
}
export class Breakpoint extends Comparable {
    constructor(id, line) {
        super();
        this.id = id;
        this.line = line;
    }
    equals(other) {
        return other.id === this.id;
    }
}
//# sourceMappingURL=Breakpoint.js.map