(assert_return (invoke "f32.no_fold_zero_div" (f32.const 0.0)) (f32.const nan:canonical))
(assert_return (invoke "f32.no_fold_zero_div" (f32.const -0.0)) (f32.const nan:canonical))
(assert_return (invoke "f32.no_fold_zero_div" (f32.const nan)) (f32.const nan:canonical))
(assert_return (invoke "f32.no_fold_zero_div" (f32.const nan:0x200000)) (f32.const nan:arithmetic))
(assert_return (invoke "f64.no_fold_zero_div" (f64.const 0.0)) (f64.const nan:canonical))
(assert_return (invoke "f64.no_fold_zero_div" (f64.const -0.0)) (f64.const nan:canonical))
(assert_return (invoke "f64.no_fold_zero_div" (f64.const nan)) (f64.const nan:canonical))
(assert_return (invoke "f64.no_fold_zero_div" (f64.const nan:0x4000000000000)) (f64.const nan:arithmetic))


