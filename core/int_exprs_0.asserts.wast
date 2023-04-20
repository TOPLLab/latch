(assert_return (invoke "i32.no_fold_cmp_s_offset" (i32.const 0x7fffffff) (i32.const 0)) (i32.const 1))
(assert_return (invoke "i32.no_fold_cmp_u_offset" (i32.const 0xffffffff) (i32.const 0)) (i32.const 1))
(assert_return (invoke "i64.no_fold_cmp_s_offset" (i64.const 0x7fffffffffffffff) (i64.const 0)) (i32.const 1))
(assert_return (invoke "i64.no_fold_cmp_u_offset" (i64.const 0xffffffffffffffff) (i64.const 0)) (i32.const 1))


