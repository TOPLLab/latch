(assert_return (invoke "type-local-i32") (i32.const 0))
(assert_return (invoke "type-local-i64") (i64.const 0))
(assert_return (invoke "type-local-f32") (f32.const 0))
(assert_return (invoke "type-local-f64") (f64.const 0))

(assert_return (invoke "type-param-i32" (i32.const 2)) (i32.const 2))
(assert_return (invoke "type-param-i64" (i64.const 3)) (i64.const 3))
(assert_return (invoke "type-param-f32" (f32.const 4.4)) (f32.const 4.4))
(assert_return (invoke "type-param-f64" (f64.const 5.5)) (f64.const 5.5))

(assert_return (invoke "as-block-value" (i32.const 6)) (i32.const 6))
(assert_return (invoke "as-loop-value" (i32.const 7)) (i32.const 7))

(assert_return (invoke "as-br-value" (i32.const 8)) (i32.const 8))
(assert_return (invoke "as-br_if-value" (i32.const 9)) (i32.const 9))
(assert_return (invoke "as-br_if-value-cond" (i32.const 10)) (i32.const 10))
(assert_return (invoke "as-br_table-value" (i32.const 1)) (i32.const 2))

(assert_return (invoke "as-return-value" (i32.const 0)) (i32.const 0))

(assert_return (invoke "as-if-then" (i32.const 1)) (i32.const 1))
(assert_return (invoke "as-if-else" (i32.const 0)) (i32.const 0))

(assert_return
  (invoke "type-mixed"
    (i64.const 1) (f32.const 2.2) (f64.const 3.3) (i32.const 4) (i32.const 5)
  )
)

(assert_return
  (invoke "read"
    (i64.const 1) (f32.const 2) (f64.const 3.3) (i32.const 4) (i32.const 5)
  )
  (f64.const 34.8)
)



