(module
  (func (export "f32.no_algebraic_factoring") (param $x f32) (param $y f32) (result f32)
    (f32.mul (f32.add (local.get $x) (local.get $y))
             (f32.sub (local.get $x) (local.get $y))))

  (func (export "f64.no_algebraic_factoring") (param $x f64) (param $y f64) (result f64)
    (f64.mul (f64.add (local.get $x) (local.get $y))
             (f64.sub (local.get $x) (local.get $y))))
)

