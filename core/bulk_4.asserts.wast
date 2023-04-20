(assert_return (invoke "load8_u" (i32.const 0)) (i32.const 0xbb))
(assert_return (invoke "load8_u" (i32.const 1)) (i32.const 0xcc))
(assert_return (invoke "load8_u" (i32.const 2)) (i32.const 0))

(assert_trap (invoke "init" (i32.const 0xfffe) (i32.const 0) (i32.const 3))
    "out of bounds memory access")
(assert_return (invoke "load8_u" (i32.const 0xfffe)) (i32.const 0xcc))
(assert_return (invoke "load8_u" (i32.const 0xffff)) (i32.const 0xdd))

(assert_trap (invoke "init" (i32.const 0x10001) (i32.const 0) (i32.const 0))
    "out of bounds memory access")
(assert_trap (invoke "init" (i32.const 0) (i32.const 5) (i32.const 0))
    "out of bounds memory access")

