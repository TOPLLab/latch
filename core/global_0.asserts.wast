(assert_return (invoke "get-a") (i32.const -2))
(assert_return (invoke "get-b") (i64.const -5))
(assert_return (invoke "get-r") (ref.null extern))
(assert_return (invoke "get-mr") (ref.null extern))
(assert_return (invoke "get-x") (i32.const -12))
(assert_return (invoke "get-y") (i64.const -15))
(assert_return (invoke "get-z1") (i32.const 666))
(assert_return (invoke "get-z2") (i64.const 666))

(assert_return (invoke "get-3") (f32.const -3))
(assert_return (invoke "get-4") (f64.const -4))
(assert_return (invoke "get-7") (f32.const -13))
(assert_return (invoke "get-8") (f64.const -14))

(assert_return (invoke "set-x" (i32.const 6)))
(assert_return (invoke "set-y" (i64.const 7)))

(assert_return (invoke "set-7" (f32.const 8)))
(assert_return (invoke "set-8" (f64.const 9)))

(assert_return (invoke "get-x") (i32.const 6))
(assert_return (invoke "get-y") (i64.const 7))
(assert_return (invoke "get-7") (f32.const 8))
(assert_return (invoke "get-8") (f64.const 9))

(assert_return (invoke "set-7" (f32.const 8)))
(assert_return (invoke "set-8" (f64.const 9)))
(assert_return (invoke "set-mr" (ref.extern 10)))

(assert_return (invoke "get-x") (i32.const 6))
(assert_return (invoke "get-y") (i64.const 7))
(assert_return (invoke "get-7") (f32.const 8))
(assert_return (invoke "get-8") (f64.const 9))
(assert_return (invoke "get-mr") (ref.extern 10))

(assert_return (invoke "as-select-first") (i32.const 6))
(assert_return (invoke "as-select-mid") (i32.const 2))
(assert_return (invoke "as-select-last") (i32.const 2))

(assert_return (invoke "as-loop-first") (i32.const 6))
(assert_return (invoke "as-loop-mid") (i32.const 6))
(assert_return (invoke "as-loop-last") (i32.const 6))

(assert_return (invoke "as-if-condition") (i32.const 2))
(assert_return (invoke "as-if-then") (i32.const 6))
(assert_return (invoke "as-if-else") (i32.const 6))

(assert_return (invoke "as-br_if-first") (i32.const 6))
(assert_return (invoke "as-br_if-last") (i32.const 2))

(assert_return (invoke "as-br_table-first") (i32.const 6))
(assert_return (invoke "as-br_table-last") (i32.const 2))

(assert_return (invoke "as-call_indirect-first") (i32.const 6))
(assert_return (invoke "as-call_indirect-mid") (i32.const 2))
(assert_trap (invoke "as-call_indirect-last") "undefined element")

(assert_return (invoke "as-store-first"))
(assert_return (invoke "as-store-last"))
(assert_return (invoke "as-load-operand") (i32.const 1))
(assert_return (invoke "as-memory.grow-value") (i32.const 1))

(assert_return (invoke "as-call-value") (i32.const 6))

(assert_return (invoke "as-return-value") (i32.const 6))
(assert_return (invoke "as-drop-operand"))
(assert_return (invoke "as-br-value") (i32.const 6))

(assert_return (invoke "as-local.set-value" (i32.const 1)) (i32.const 6))
(assert_return (invoke "as-local.tee-value" (i32.const 1)) (i32.const 6))
(assert_return (invoke "as-global.set-value") (i32.const 6))

(assert_return (invoke "as-unary-operand") (i32.const 0))
(assert_return (invoke "as-binary-operand") (i32.const 36))
(assert_return (invoke "as-compare-operand") (i32.const 1))

