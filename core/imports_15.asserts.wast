(assert_trap (invoke "call" (i32.const 0)) "uninitialized element")
(assert_return (invoke "call" (i32.const 1)) (i32.const 11))
(assert_return (invoke "call" (i32.const 2)) (i32.const 22))
(assert_trap (invoke "call" (i32.const 3)) "uninitialized element")
(assert_trap (invoke "call" (i32.const 100)) "undefined element")


