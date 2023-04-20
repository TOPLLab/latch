(assert_return (invoke "empty" (i32.const 0)))
(assert_return (invoke "empty" (i32.const 1)))
(assert_return (invoke "empty" (i32.const 100)))
(assert_return (invoke "empty" (i32.const -2)))

(assert_return (invoke "singular" (i32.const 0)) (i32.const 8))
(assert_return (invoke "singular" (i32.const 1)) (i32.const 7))
(assert_return (invoke "singular" (i32.const 10)) (i32.const 7))
(assert_return (invoke "singular" (i32.const -10)) (i32.const 7))

(assert_return (invoke "multi" (i32.const 0)) (i32.const 9) (i32.const -1))
(assert_return (invoke "multi" (i32.const 1)) (i32.const 8) (i32.const 1))
(assert_return (invoke "multi" (i32.const 13)) (i32.const 8) (i32.const 1))
(assert_return (invoke "multi" (i32.const -5)) (i32.const 8) (i32.const 1))

(assert_return (invoke "nested" (i32.const 0) (i32.const 0)) (i32.const 11))
(assert_return (invoke "nested" (i32.const 1) (i32.const 0)) (i32.const 10))
(assert_return (invoke "nested" (i32.const 0) (i32.const 1)) (i32.const 10))
(assert_return (invoke "nested" (i32.const 3) (i32.const 2)) (i32.const 9))
(assert_return (invoke "nested" (i32.const 0) (i32.const -100)) (i32.const 10))
(assert_return (invoke "nested" (i32.const 10) (i32.const 10)) (i32.const 9))
(assert_return (invoke "nested" (i32.const 0) (i32.const -1)) (i32.const 10))
(assert_return (invoke "nested" (i32.const -111) (i32.const -2)) (i32.const 9))

(assert_return (invoke "as-select-first" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-select-first" (i32.const 1)) (i32.const 1))
(assert_return (invoke "as-select-mid" (i32.const 0)) (i32.const 2))
(assert_return (invoke "as-select-mid" (i32.const 1)) (i32.const 2))
(assert_return (invoke "as-select-last" (i32.const 0)) (i32.const 3))
(assert_return (invoke "as-select-last" (i32.const 1)) (i32.const 2))

(assert_return (invoke "as-loop-first" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-loop-first" (i32.const 1)) (i32.const 1))
(assert_return (invoke "as-loop-mid" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-loop-mid" (i32.const 1)) (i32.const 1))
(assert_return (invoke "as-loop-last" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-loop-last" (i32.const 1)) (i32.const 1))

(assert_return (invoke "as-if-condition" (i32.const 0)) (i32.const 3))
(assert_return (invoke "as-if-condition" (i32.const 1)) (i32.const 2))

(assert_return (invoke "as-br_if-first" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-br_if-first" (i32.const 1)) (i32.const 1))
(assert_return (invoke "as-br_if-last" (i32.const 0)) (i32.const 3))
(assert_return (invoke "as-br_if-last" (i32.const 1)) (i32.const 2))

(assert_return (invoke "as-br_table-first" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-br_table-first" (i32.const 1)) (i32.const 1))
(assert_return (invoke "as-br_table-last" (i32.const 0)) (i32.const 2))
(assert_return (invoke "as-br_table-last" (i32.const 1)) (i32.const 2))

(assert_return (invoke "as-call_indirect-first" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-call_indirect-first" (i32.const 1)) (i32.const 1))
(assert_return (invoke "as-call_indirect-mid" (i32.const 0)) (i32.const 2))
(assert_return (invoke "as-call_indirect-mid" (i32.const 1)) (i32.const 2))
(assert_return (invoke "as-call_indirect-last" (i32.const 0)) (i32.const 2))
(assert_trap (invoke "as-call_indirect-last" (i32.const 1)) "undefined element")

(assert_return (invoke "as-store-first" (i32.const 0)))
(assert_return (invoke "as-store-first" (i32.const 1)))
(assert_return (invoke "as-store-last" (i32.const 0)))
(assert_return (invoke "as-store-last" (i32.const 1)))

(assert_return (invoke "as-memory.grow-value" (i32.const 0)) (i32.const 1))
(assert_return (invoke "as-memory.grow-value" (i32.const 1)) (i32.const 1))

(assert_return (invoke "as-call-value" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-call-value" (i32.const 1)) (i32.const 1))

(assert_return (invoke "as-return-value" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-return-value" (i32.const 1)) (i32.const 1))

(assert_return (invoke "as-drop-operand" (i32.const 0)))
(assert_return (invoke "as-drop-operand" (i32.const 1)))

(assert_return (invoke "as-br-value" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-br-value" (i32.const 1)) (i32.const 1))

(assert_return (invoke "as-local.set-value" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-local.set-value" (i32.const 1)) (i32.const 1))

(assert_return (invoke "as-local.tee-value" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-local.tee-value" (i32.const 1)) (i32.const 1))

(assert_return (invoke "as-global.set-value" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-global.set-value" (i32.const 1)) (i32.const 1))

(assert_return (invoke "as-load-operand" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-load-operand" (i32.const 1)) (i32.const 0))

(assert_return (invoke "as-unary-operand" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-unary-operand" (i32.const 1)) (i32.const 0))
(assert_return (invoke "as-unary-operand" (i32.const -1)) (i32.const 0))

(assert_return (invoke "as-binary-operand" (i32.const 0) (i32.const 0)) (i32.const 15))
(assert_return (invoke "as-binary-operand" (i32.const 0) (i32.const 1)) (i32.const -12))
(assert_return (invoke "as-binary-operand" (i32.const 1) (i32.const 0)) (i32.const -15))
(assert_return (invoke "as-binary-operand" (i32.const 1) (i32.const 1)) (i32.const 12))

(assert_return (invoke "as-test-operand" (i32.const 0)) (i32.const 1))
(assert_return (invoke "as-test-operand" (i32.const 1)) (i32.const 0))

(assert_return (invoke "as-compare-operand" (i32.const 0) (i32.const 0)) (i32.const 1))
(assert_return (invoke "as-compare-operand" (i32.const 0) (i32.const 1)) (i32.const 0))
(assert_return (invoke "as-compare-operand" (i32.const 1) (i32.const 0)) (i32.const 1))
(assert_return (invoke "as-compare-operand" (i32.const 1) (i32.const 1)) (i32.const 0))

(assert_return (invoke "as-binary-operands" (i32.const 0)) (i32.const -12))
(assert_return (invoke "as-binary-operands" (i32.const 1)) (i32.const 12))

(assert_return (invoke "as-compare-operands" (i32.const 0)) (i32.const 1))
(assert_return (invoke "as-compare-operands" (i32.const 1)) (i32.const 0))

(assert_return (invoke "as-mixed-operands" (i32.const 0)) (i32.const -3))
(assert_return (invoke "as-mixed-operands" (i32.const 1)) (i32.const 27))

(assert_return (invoke "break-bare") (i32.const 19))
(assert_return (invoke "break-value" (i32.const 1)) (i32.const 18))
(assert_return (invoke "break-value" (i32.const 0)) (i32.const 21))
(assert_return (invoke "break-multi-value" (i32.const 0))
  (i32.const -18) (i32.const 18) (i64.const -18)
)
(assert_return (invoke "break-multi-value" (i32.const 1))
  (i32.const 18) (i32.const -18) (i64.const 18)
)

(assert_return (invoke "param" (i32.const 0)) (i32.const -1))
(assert_return (invoke "param" (i32.const 1)) (i32.const 3))
(assert_return (invoke "params" (i32.const 0)) (i32.const -1))
(assert_return (invoke "params" (i32.const 1)) (i32.const 3))
(assert_return (invoke "params-id" (i32.const 0)) (i32.const 3))
(assert_return (invoke "params-id" (i32.const 1)) (i32.const 3))
(assert_return (invoke "param-break" (i32.const 0)) (i32.const -1))
(assert_return (invoke "param-break" (i32.const 1)) (i32.const 3))
(assert_return (invoke "params-break" (i32.const 0)) (i32.const -1))
(assert_return (invoke "params-break" (i32.const 1)) (i32.const 3))
(assert_return (invoke "params-id-break" (i32.const 0)) (i32.const 3))
(assert_return (invoke "params-id-break" (i32.const 1)) (i32.const 3))

(assert_return (invoke "effects" (i32.const 1)) (i32.const -14))
(assert_return (invoke "effects" (i32.const 0)) (i32.const -6))

(assert_return
  (invoke "add64_u_with_carry" (i64.const 0) (i64.const 0) (i32.const 0))
  (i64.const 0) (i32.const 0)
)
(assert_return
  (invoke "add64_u_with_carry" (i64.const 100) (i64.const 124) (i32.const 0))
  (i64.const 224) (i32.const 0)
)
(assert_return
  (invoke "add64_u_with_carry" (i64.const -1) (i64.const 0) (i32.const 0))
  (i64.const -1) (i32.const 0)
)
(assert_return
  (invoke "add64_u_with_carry" (i64.const -1) (i64.const 1) (i32.const 0))
  (i64.const 0) (i32.const 1)
)
(assert_return
  (invoke "add64_u_with_carry" (i64.const -1) (i64.const -1) (i32.const 0))
  (i64.const -2) (i32.const 1)
)
(assert_return
  (invoke "add64_u_with_carry" (i64.const -1) (i64.const 0) (i32.const 1))
  (i64.const 0) (i32.const 1)
)
(assert_return
  (invoke "add64_u_with_carry" (i64.const -1) (i64.const 1) (i32.const 1))
  (i64.const 1) (i32.const 1)
)
(assert_return
  (invoke "add64_u_with_carry" (i64.const 0x8000000000000000) (i64.const 0x8000000000000000) (i32.const 0))
  (i64.const 0) (i32.const 1)
)

(assert_return
  (invoke "add64_u_saturated" (i64.const 0) (i64.const 0)) (i64.const 0)
)
(assert_return
  (invoke "add64_u_saturated" (i64.const 1230) (i64.const 23)) (i64.const 1253)
)
(assert_return
  (invoke "add64_u_saturated" (i64.const -1) (i64.const 0)) (i64.const -1)
)
(assert_return
  (invoke "add64_u_saturated" (i64.const -1) (i64.const 1)) (i64.const -1)
)
(assert_return
  (invoke "add64_u_saturated" (i64.const -1) (i64.const -1)) (i64.const -1)
)
(assert_return
  (invoke "add64_u_saturated" (i64.const 0x8000000000000000) (i64.const 0x8000000000000000)) (i64.const -1)
)

(assert_return (invoke "type-use"))

