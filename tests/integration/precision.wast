(module
  (func (export "i64_get_max") (result i64)
    (i64.const 9223372036854775807))

  (func (export "i64_eq_max") (param i64) (result i32)
    (i64.eq
      (local.get 0)
      (i64.const 9223372036854775807)))

  (func (export "i64_eq_max_wrong") (param i64) (result i32)
    (i64.eq
      (local.get 0)
      (i64.const 9223372036854776000)))
)
