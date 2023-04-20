(module
  (func (export "i32.no_fold_f32_s") (param i32) (result i32)
    (i32.trunc_f32_s (f32.convert_i32_s (local.get 0))))
  (func (export "i32.no_fold_f32_u") (param i32) (result i32)
    (i32.trunc_f32_u (f32.convert_i32_u (local.get 0))))
  (func (export "i64.no_fold_f64_s") (param i64) (result i64)
    (i64.trunc_f64_s (f64.convert_i64_s (local.get 0))))
  (func (export "i64.no_fold_f64_u") (param i64) (result i64)
    (i64.trunc_f64_u (f64.convert_i64_u (local.get 0))))
)

