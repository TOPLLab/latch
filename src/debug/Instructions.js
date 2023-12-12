export var Instruction;
(function (Instruction) {
    Instruction["run"] = "01";
    Instruction["halt"] = "02";
    Instruction["pause"] = "03";
    Instruction["step"] = "04";
    Instruction["addBreakpoint"] = "06";
    Instruction["removeBreakpoint"] = "07";
    Instruction["dump"] = "10";
    Instruction["dumpLocals"] = "11";
    Instruction["dumpAll"] = "12";
    Instruction["reset"] = "13";
    Instruction["updateFunction"] = "20";
    Instruction["updateModule"] = "22";
    Instruction["invoke"] = "40";
    // Pull debugging messages
    Instruction["snapshot"] = "60";
    Instruction["offset"] = "61";
    Instruction["loadSnapshot"] = "62";
    Instruction["updateProxies"] = "63";
    Instruction["proxyCall"] = "64";
    Instruction["proxify"] = "65";
    // Push debugging messages
    Instruction["dumpAllEvents"] = "70";
    Instruction["dumpEvents"] = "71";
    Instruction["popEvent"] = "72";
    Instruction["pushEvent"] = "73";
    Instruction["dumpCallbackmapping"] = "74";
    Instruction["updateCallbackmapping"] = "75";
})(Instruction || (Instruction = {}));
//# sourceMappingURL=Instructions.js.map