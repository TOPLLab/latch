(assert_return (invoke "get-externref" (i32.const 0)) (ref.null extern))
(assert_return (invoke "set-externref" (i32.const 0) (ref.extern 1)))
(assert_return (invoke "get-externref" (i32.const 0)) (ref.extern 1))
(assert_return (invoke "set-externref" (i32.const 0) (ref.null extern)))
(assert_return (invoke "get-externref" (i32.const 0)) (ref.null extern))

(assert_return (invoke "get-funcref" (i32.const 0)) (ref.null func))
(assert_return (invoke "set-funcref-from" (i32.const 0) (i32.const 1)))
(assert_return (invoke "is_null-funcref" (i32.const 0)) (i32.const 0))
(assert_return (invoke "set-funcref" (i32.const 0) (ref.null func)))
(assert_return (invoke "get-funcref" (i32.const 0)) (ref.null func))

(assert_trap (invoke "set-externref" (i32.const 2) (ref.null extern)) "out of bounds table access")
(assert_trap (invoke "set-funcref" (i32.const 3) (ref.null func)) "out of bounds table access")
(assert_trap (invoke "set-externref" (i32.const -1) (ref.null extern)) "out of bounds table access")
(assert_trap (invoke "set-funcref" (i32.const -1) (ref.null func)) "out of bounds table access")

(assert_trap (invoke "set-externref" (i32.const 2) (ref.extern 0)) "out of bounds table access")
(assert_trap (invoke "set-funcref-from" (i32.const 3) (i32.const 1)) "out of bounds table access")
(assert_trap (invoke "set-externref" (i32.const -1) (ref.extern 0)) "out of bounds table access")
(assert_trap (invoke "set-funcref-from" (i32.const -1) (i32.const 1)) "out of bounds table access")



