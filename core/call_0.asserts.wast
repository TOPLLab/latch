(assert_return (invoke "type-i32") (i32.const 0x132))
(assert_return (invoke "type-i64") (i64.const 0x164))
(assert_return (invoke "type-f32") (f32.const 0xf32))
(assert_return (invoke "type-f64") (f64.const 0xf64))
(assert_return (invoke "type-i32-i64") (i32.const 0x132) (i64.const 0x164))

(assert_return (invoke "type-first-i32") (i32.const 32))
(assert_return (invoke "type-first-i64") (i64.const 64))
(assert_return (invoke "type-first-f32") (f32.const 1.32))
(assert_return (invoke "type-first-f64") (f64.const 1.64))

(assert_return (invoke "type-second-i32") (i32.const 32))
(assert_return (invoke "type-second-i64") (i64.const 64))
(assert_return (invoke "type-second-f32") (f32.const 32))
(assert_return (invoke "type-second-f64") (f64.const 64.1))

(assert_return (invoke "type-all-i32-f64") (i32.const 32) (f64.const 1.64))
(assert_return (invoke "type-all-i32-i32") (i32.const 2) (i32.const 1))
(assert_return (invoke "type-all-f32-f64") (f64.const 2) (f32.const 1))
(assert_return (invoke "type-all-f64-i32") (i32.const 2) (f64.const 1))

(assert_return (invoke "as-binary-all-operands") (i32.const 7))
(assert_return (invoke "as-mixed-operands") (i32.const 32))
(assert_return (invoke "as-call-all-operands") (i32.const 3) (i32.const 4))

(assert_return (invoke "fac" (i64.const 0)) (i64.const 1))
(assert_return (invoke "fac" (i64.const 1)) (i64.const 1))
(assert_return (invoke "fac" (i64.const 5)) (i64.const 120))
(assert_return (invoke "fac" (i64.const 25)) (i64.const 7034535277573963776))
(assert_return (invoke "fac-acc" (i64.const 0) (i64.const 1)) (i64.const 1))
(assert_return (invoke "fac-acc" (i64.const 1) (i64.const 1)) (i64.const 1))
(assert_return (invoke "fac-acc" (i64.const 5) (i64.const 1)) (i64.const 120))
(assert_return
  (invoke "fac-acc" (i64.const 25) (i64.const 1))
  (i64.const 7034535277573963776)
)

(assert_return (invoke "fib" (i64.const 0)) (i64.const 1))
(assert_return (invoke "fib" (i64.const 1)) (i64.const 1))
(assert_return (invoke "fib" (i64.const 2)) (i64.const 2))
(assert_return (invoke "fib" (i64.const 5)) (i64.const 8))
(assert_return (invoke "fib" (i64.const 20)) (i64.const 10946))

(assert_return (invoke "even" (i64.const 0)) (i32.const 44))
(assert_return (invoke "even" (i64.const 1)) (i32.const 99))
(assert_return (invoke "even" (i64.const 100)) (i32.const 44))
(assert_return (invoke "even" (i64.const 77)) (i32.const 99))
(assert_return (invoke "odd" (i64.const 0)) (i32.const 99))
(assert_return (invoke "odd" (i64.const 1)) (i32.const 44))
(assert_return (invoke "odd" (i64.const 200)) (i32.const 99))
(assert_return (invoke "odd" (i64.const 77)) (i32.const 44))

(assert_exhaustion (invoke "runaway") "call stack exhausted")
(assert_exhaustion (invoke "mutual-runaway") "call stack exhausted")

(assert_return (invoke "as-select-first") (i32.const 0x132))
(assert_return (invoke "as-select-mid") (i32.const 2))
(assert_return (invoke "as-select-last") (i32.const 2))

(assert_return (invoke "as-if-condition") (i32.const 1))

(assert_return (invoke "as-br_if-first") (i32.const 0x132))
(assert_return (invoke "as-br_if-last") (i32.const 2))

(assert_return (invoke "as-br_table-first") (i32.const 0x132))
(assert_return (invoke "as-br_table-last") (i32.const 2))

(assert_return (invoke "as-call_indirect-first") (i32.const 0x132))
(assert_return (invoke "as-call_indirect-mid") (i32.const 2))
(assert_trap (invoke "as-call_indirect-last") "undefined element")

(assert_return (invoke "as-store-first"))
(assert_return (invoke "as-store-last"))

(assert_return (invoke "as-memory.grow-value") (i32.const 1))
(assert_return (invoke "as-return-value") (i32.const 0x132))
(assert_return (invoke "as-drop-operand"))
(assert_return (invoke "as-br-value") (i32.const 0x132))
(assert_return (invoke "as-local.set-value") (i32.const 0x132))
(assert_return (invoke "as-local.tee-value") (i32.const 0x132))
(assert_return (invoke "as-global.set-value") (i32.const 0x132))
(assert_return (invoke "as-load-operand") (i32.const 1))

(assert_return (invoke "as-unary-operand") (f32.const 0x0p+0))
(assert_return (invoke "as-binary-left") (i32.const 11))
(assert_return (invoke "as-binary-right") (i32.const 9))
(assert_return (invoke "as-test-operand") (i32.const 0))
(assert_return (invoke "as-compare-left") (i32.const 1))
(assert_return (invoke "as-compare-right") (i32.const 1))
(assert_return (invoke "as-convert-operand") (i64.const 1))

(assert_return (invoke "return-from-long-argument-list" (i32.const 42)) (i32.const 42))


