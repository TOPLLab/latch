(assert_return (invoke "load" (i32.const 0)) (i32.const 0))
(assert_return (invoke "load" (i32.const 10)) (i32.const 16))
(assert_return (invoke "load" (i32.const 8)) (i32.const 0x100000))
(assert_trap (invoke "load" (i32.const 1000000)) "out of bounds memory access")

