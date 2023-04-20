(assert_return (invoke "load8_u" (i32.const 0)) (i32.const 0))
(assert_return (invoke "load8_u" (i32.const 1)) (i32.const 0xff))
(assert_return (invoke "load8_u" (i32.const 2)) (i32.const 0xff))
(assert_return (invoke "load8_u" (i32.const 3)) (i32.const 0xff))
(assert_return (invoke "load8_u" (i32.const 4)) (i32.const 0))

(assert_return (invoke "load8_u" (i32.const 0)) (i32.const 0xaa))
(assert_return (invoke "load8_u" (i32.const 1)) (i32.const 0xaa))

(assert_trap (invoke "fill" (i32.const 0xff00) (i32.const 1) (i32.const 0x101))
    "out of bounds memory access")
(assert_return (invoke "load8_u" (i32.const 0xff00)) (i32.const 0))
(assert_return (invoke "load8_u" (i32.const 0xffff)) (i32.const 0))

(assert_trap (invoke "fill" (i32.const 0x10001) (i32.const 0) (i32.const 0))
    "out of bounds memory access")


