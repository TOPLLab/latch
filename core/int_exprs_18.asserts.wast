(assert_trap (invoke "i32.no_fold_div_neg1" (i32.const 0x80000000)) "integer overflow")
(assert_trap (invoke "i64.no_fold_div_neg1" (i64.const 0x8000000000000000)) "integer overflow")
