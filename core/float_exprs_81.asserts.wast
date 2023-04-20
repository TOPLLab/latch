(assert_return (invoke "f32.no_fold_sub1_mul_add" (f32.const 0x1p-32) (f32.const 1.0)) (f32.const 0x0p+0))
(assert_return (invoke "f64.no_fold_sub1_mul_add" (f64.const 0x1p-64) (f64.const 1.0)) (f64.const 0x0p+0))


