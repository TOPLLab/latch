(assert_trap (invoke "no_dce.i32.div_s" (i32.const 1) (i32.const 0)) "integer divide by zero")
(assert_trap (invoke "no_dce.i32.div_u" (i32.const 1) (i32.const 0)) "integer divide by zero")
(assert_trap (invoke "no_dce.i64.div_s" (i64.const 1) (i64.const 0)) "integer divide by zero")
(assert_trap (invoke "no_dce.i64.div_u" (i64.const 1) (i64.const 0)) "integer divide by zero")
(assert_trap (invoke "no_dce.i32.div_s" (i32.const 0x80000000) (i32.const -1)) "integer overflow")
(assert_trap (invoke "no_dce.i64.div_s" (i64.const 0x8000000000000000) (i64.const -1)) "integer overflow")

