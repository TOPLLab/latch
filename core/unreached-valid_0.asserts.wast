(assert_trap (invoke "select-trap-left" (i32.const 1)) "unreachable")
(assert_trap (invoke "select-trap-left" (i32.const 0)) "unreachable")
(assert_trap (invoke "select-trap-right" (i32.const 1)) "unreachable")
(assert_trap (invoke "select-trap-right" (i32.const 0)) "unreachable")


