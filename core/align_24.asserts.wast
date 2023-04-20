(assert_trap (invoke "store" (i32.const 65532) (i64.const -1)) "out of bounds memory access")
(assert_return (invoke "load" (i32.const 65532)) (i32.const 0))
