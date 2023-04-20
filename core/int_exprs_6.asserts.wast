(assert_trap (invoke "i32.no_fold_div_s_self" (i32.const 0)) "integer divide by zero")
(assert_trap (invoke "i32.no_fold_div_u_self" (i32.const 0)) "integer divide by zero")
(assert_trap (invoke "i64.no_fold_div_s_self" (i64.const 0)) "integer divide by zero")
(assert_trap (invoke "i64.no_fold_div_u_self" (i64.const 0)) "integer divide by zero")


