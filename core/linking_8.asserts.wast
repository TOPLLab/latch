(assert_return (invoke $Mt "call" (i32.const 2)) (i32.const 4))
(assert_return (invoke $Nt "Mt.call" (i32.const 2)) (i32.const 4))
(assert_return (invoke $Nt "call" (i32.const 2)) (i32.const 5))
(assert_return (invoke $Nt "call Mt.call" (i32.const 2)) (i32.const 4))

(assert_trap (invoke $Mt "call" (i32.const 1)) "uninitialized element")
(assert_trap (invoke $Nt "Mt.call" (i32.const 1)) "uninitialized element")
(assert_return (invoke $Nt "call" (i32.const 1)) (i32.const 5))
(assert_trap (invoke $Nt "call Mt.call" (i32.const 1)) "uninitialized element")

(assert_trap (invoke $Mt "call" (i32.const 0)) "uninitialized element")
(assert_trap (invoke $Nt "Mt.call" (i32.const 0)) "uninitialized element")
(assert_return (invoke $Nt "call" (i32.const 0)) (i32.const 5))
(assert_trap (invoke $Nt "call Mt.call" (i32.const 0)) "uninitialized element")

(assert_trap (invoke $Mt "call" (i32.const 20)) "undefined element")
(assert_trap (invoke $Nt "Mt.call" (i32.const 20)) "undefined element")
(assert_trap (invoke $Nt "call" (i32.const 7)) "undefined element")
(assert_trap (invoke $Nt "call Mt.call" (i32.const 20)) "undefined element")

(assert_return (invoke $Nt "call" (i32.const 3)) (i32.const -4))
(assert_trap (invoke $Nt "call" (i32.const 4)) "indirect call type mismatch")

