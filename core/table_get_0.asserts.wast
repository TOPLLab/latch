(assert_return (invoke "get-externref" (i32.const 0)) (ref.null extern))
(assert_return (invoke "get-externref" (i32.const 1)) (ref.extern 1))

(assert_return (invoke "get-funcref" (i32.const 0)) (ref.null func))
(assert_return (invoke "is_null-funcref" (i32.const 1)) (i32.const 0))
(assert_return (invoke "is_null-funcref" (i32.const 2)) (i32.const 0))

(assert_trap (invoke "get-externref" (i32.const 2)) "out of bounds table access")
(assert_trap (invoke "get-funcref" (i32.const 3)) "out of bounds table access")
(assert_trap (invoke "get-externref" (i32.const -1)) "out of bounds table access")
(assert_trap (invoke "get-funcref" (i32.const -1)) "out of bounds table access")



