(assert_return (invoke "size") (i32.const 0))
(assert_trap (invoke "set" (i32.const 0) (ref.extern 2)) "out of bounds table access")
(assert_trap (invoke "get" (i32.const 0)) "out of bounds table access")

(assert_return (invoke "grow" (i32.const 1) (ref.null extern)) (i32.const 0))
(assert_return (invoke "size") (i32.const 1))
(assert_return (invoke "get" (i32.const 0)) (ref.null extern))
(assert_return (invoke "set" (i32.const 0) (ref.extern 2)))
(assert_return (invoke "get" (i32.const 0)) (ref.extern 2))
(assert_trap (invoke "set" (i32.const 1) (ref.extern 2)) "out of bounds table access")
(assert_trap (invoke "get" (i32.const 1)) "out of bounds table access")

(assert_return (invoke "grow" (i32.const 4) (ref.extern 3)) (i32.const 1))
(assert_return (invoke "size") (i32.const 5))
(assert_return (invoke "get" (i32.const 0)) (ref.extern 2))
(assert_return (invoke "set" (i32.const 0) (ref.extern 2)))
(assert_return (invoke "get" (i32.const 0)) (ref.extern 2))
(assert_return (invoke "get" (i32.const 1)) (ref.extern 3))
(assert_return (invoke "get" (i32.const 4)) (ref.extern 3))
(assert_return (invoke "set" (i32.const 4) (ref.extern 4)))
(assert_return (invoke "get" (i32.const 4)) (ref.extern 4))
(assert_trap (invoke "set" (i32.const 5) (ref.extern 2)) "out of bounds table access")
(assert_trap (invoke "get" (i32.const 5)) "out of bounds table access")


