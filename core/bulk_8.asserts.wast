(assert_trap (invoke "init" (i32.const 2) (i32.const 0) (i32.const 2))
    "out of bounds table access")
(assert_trap (invoke "call" (i32.const 2))
    "uninitialized element 2")

(assert_return (invoke "call" (i32.const 0)) (i32.const 1))
(assert_return (invoke "call" (i32.const 1)) (i32.const 0))
(assert_trap (invoke "call" (i32.const 2)) "uninitialized element")

(assert_trap (invoke "init" (i32.const 4) (i32.const 0) (i32.const 0))
    "out of bounds table access")
(assert_trap (invoke "init" (i32.const 0) (i32.const 5) (i32.const 0))
    "out of bounds table access")


