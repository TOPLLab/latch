(module
  (func (export "f32.no_fold_conditional_inc") (param $x f32) (param $y f32) (result f32)
    (select (local.get $x)
            (f32.add (local.get $x) (f32.const 1.0))
            (f32.lt (local.get $y) (f32.const 0.0))))
  (func (export "f64.no_fold_conditional_inc") (param $x f64) (param $y f64) (result f64)
    (select (local.get $x)
            (f64.add (local.get $x) (f64.const 1.0))
            (f64.lt (local.get $y) (f64.const 0.0))))
)

