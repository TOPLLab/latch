(assert_return (invoke "type-local-i32") (i32.const 0))
(assert_return (invoke "type-local-i64") (i64.const 0))
(assert_return (invoke "type-local-f32") (f32.const 0))
(assert_return (invoke "type-local-f64") (f64.const 0))

(assert_return (invoke "type-param-i32" (i32.const 2)) (i32.const 10))
(assert_return (invoke "type-param-i64" (i64.const 3)) (i64.const 11))
(assert_return (invoke "type-param-f32" (f32.const 4.4)) (f32.const 11.1))
(assert_return (invoke "type-param-f64" (f64.const 5.5)) (f64.const 12.2))

(assert_return (invoke "as-block-first" (i32.const 0)) (i32.const 1))
(assert_return (invoke "as-block-mid" (i32.const 0)) (i32.const 1))
(assert_return (invoke "as-block-last" (i32.const 0)) (i32.const 1))

(assert_return (invoke "as-loop-first" (i32.const 0)) (i32.const 3))
(assert_return (invoke "as-loop-mid" (i32.const 0)) (i32.const 4))
(assert_return (invoke "as-loop-last" (i32.const 0)) (i32.const 5))

(assert_return (invoke "as-br-value" (i32.const 0)) (i32.const 9))

(assert_return (invoke "as-br_if-cond" (i32.const 0)))
(assert_return (invoke "as-br_if-value" (i32.const 0)) (i32.const 8))
(assert_return (invoke "as-br_if-value-cond" (i32.const 0)) (i32.const 6))

(assert_return (invoke "as-br_table-index" (i32.const 0)))
(assert_return (invoke "as-br_table-value" (i32.const 0)) (i32.const 10))
(assert_return (invoke "as-br_table-value-index" (i32.const 0)) (i32.const 6))

(assert_return (invoke "as-return-value" (i32.const 0)) (i32.const 7))

(assert_return (invoke "as-if-cond" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-if-then" (i32.const 1)) (i32.const 3))
(assert_return (invoke "as-if-else" (i32.const 0)) (i32.const 4))

(assert_return (invoke "as-select-first" (i32.const 0) (i32.const 1)) (i32.const 5))
(assert_return (invoke "as-select-second" (i32.const 0) (i32.const 0)) (i32.const 6))
(assert_return (invoke "as-select-cond" (i32.const 0)) (i32.const 0))

(assert_return (invoke "as-call-first" (i32.const 0)) (i32.const -1))
(assert_return (invoke "as-call-mid" (i32.const 0)) (i32.const -1))
(assert_return (invoke "as-call-last" (i32.const 0)) (i32.const -1))

(assert_return (invoke "as-call_indirect-first" (i32.const 0)) (i32.const -1))
(assert_return (invoke "as-call_indirect-mid" (i32.const 0)) (i32.const -1))
(assert_return (invoke "as-call_indirect-last" (i32.const 0)) (i32.const -1))
(assert_return (invoke "as-call_indirect-index" (i32.const 0)) (i32.const -1))

(assert_return (invoke "as-local.set-value"))
(assert_return (invoke "as-local.tee-value" (i32.const 0)) (i32.const 1))
(assert_return (invoke "as-global.set-value"))

(assert_return (invoke "as-load-address" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-loadN-address" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-store-address" (i32.const 0)))
(assert_return (invoke "as-store-value" (i32.const 0)))
(assert_return (invoke "as-storeN-address" (i32.const 0)))
(assert_return (invoke "as-storeN-value" (i32.const 0)))

(assert_return (invoke "as-unary-operand" (f32.const 0)) (f32.const -nan:0x0f1e2))
(assert_return (invoke "as-binary-left" (i32.const 0)) (i32.const 13))
(assert_return (invoke "as-binary-right" (i32.const 0)) (i32.const 6))
(assert_return (invoke "as-test-operand" (i32.const 0)) (i32.const 1))
(assert_return (invoke "as-compare-left" (i32.const 0)) (i32.const 0))
(assert_return (invoke "as-compare-right" (i32.const 0)) (i32.const 1))
(assert_return (invoke "as-convert-operand" (i64.const 0)) (i32.const 41))
(assert_return (invoke "as-memory.grow-size" (i32.const 0)) (i32.const 1))

(assert_return
  (invoke "type-mixed"
    (i64.const 1) (f32.const 2.2) (f64.const 3.3) (i32.const 4) (i32.const 5)
  )
)

(assert_return
  (invoke "write"
    (i64.const 1) (f32.const 2) (f64.const 3.3) (i32.const 4) (i32.const 5)
  )
  (i64.const 56)
)

(assert_return
  (invoke "result"
    (i64.const -1) (f32.const -2) (f64.const -3.3) (i32.const -4) (i32.const -5)
  )
  (f64.const 34.8)
)



