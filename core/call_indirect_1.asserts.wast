(assert_return (invoke "call-1" (i32.const 2) (i32.const 3) (i32.const 0)) (i32.const 5))
(assert_return (invoke "call-1" (i32.const 2) (i32.const 3) (i32.const 1)) (i32.const -1))
(assert_trap (invoke "call-1" (i32.const 2) (i32.const 3) (i32.const 2)) "undefined element")

(assert_return (invoke "call-2" (i32.const 2) (i32.const 3) (i32.const 0)) (i32.const 6))
(assert_return (invoke "call-2" (i32.const 2) (i32.const 3) (i32.const 1)) (i32.const 0))
(assert_return (invoke "call-2" (i32.const 2) (i32.const 3) (i32.const 2)) (i32.const 2))
(assert_trap (invoke "call-2" (i32.const 2) (i32.const 3) (i32.const 3)) "undefined element")

(assert_return (invoke "call-3" (i32.const 2) (i32.const 3) (i32.const 0)) (i32.const -1))
(assert_return (invoke "call-3" (i32.const 2) (i32.const 3) (i32.const 1)) (i32.const 6))
(assert_trap (invoke "call-3" (i32.const 2) (i32.const 3) (i32.const 2)) "uninitialized element")
(assert_trap (invoke "call-3" (i32.const 2) (i32.const 3) (i32.const 3)) "indirect call type mismatch")
(assert_trap (invoke "call-3" (i32.const 2) (i32.const 3) (i32.const 4)) "undefined element")



