(assert_trap (invoke "i32.div_s_0" (i32.const 71)) "integer divide by zero")
(assert_trap (invoke "i32.div_u_0" (i32.const 71)) "integer divide by zero")
(assert_trap (invoke "i64.div_s_0" (i64.const 71)) "integer divide by zero")
(assert_trap (invoke "i64.div_u_0" (i64.const 71)) "integer divide by zero")


