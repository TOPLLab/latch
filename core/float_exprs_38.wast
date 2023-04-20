(module
  (func (export "no_demote_mixed_sub") (param $x f64) (param $y f32) (result f32)
    (f32.demote_f64 (f64.sub (local.get $x) (f64.promote_f32 (local.get $y)))))
)

