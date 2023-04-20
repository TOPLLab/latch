(assert_return (invoke "f32.no_fold_zero_sub" (f32.const 0.0)) (f32.const 0.0))
(assert_return (invoke "f64.no_fold_zero_sub" (f64.const 0.0)) (f64.const 0.0))
(assert_return (invoke "f32.no_fold_zero_sub" (f32.const nan:0x200000)) (f32.const nan:arithmetic))
(assert_return (invoke "f64.no_fold_zero_sub" (f64.const nan:0x4000000000000)) (f64.const nan:arithmetic))


