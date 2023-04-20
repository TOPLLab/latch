(module
  (func (export "no_dce.i32.trunc_f32_s") (param $x f32) (drop (i32.trunc_f32_s (local.get $x))))
  (func (export "no_dce.i32.trunc_f32_u") (param $x f32) (drop (i32.trunc_f32_u (local.get $x))))
  (func (export "no_dce.i32.trunc_f64_s") (param $x f64) (drop (i32.trunc_f64_s (local.get $x))))
  (func (export "no_dce.i32.trunc_f64_u") (param $x f64) (drop (i32.trunc_f64_u (local.get $x))))
  (func (export "no_dce.i64.trunc_f32_s") (param $x f32) (drop (i64.trunc_f32_s (local.get $x))))
  (func (export "no_dce.i64.trunc_f32_u") (param $x f32) (drop (i64.trunc_f32_u (local.get $x))))
  (func (export "no_dce.i64.trunc_f64_s") (param $x f64) (drop (i64.trunc_f64_s (local.get $x))))
  (func (export "no_dce.i64.trunc_f64_u") (param $x f64) (drop (i64.trunc_f64_u (local.get $x))))
)

