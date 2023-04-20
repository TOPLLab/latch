(assert_return (invoke "f32.no_fold_div_self" (f32.const inf)) (f32.const nan:canonical))
(assert_return (invoke "f32.no_fold_div_self" (f32.const nan)) (f32.const nan:canonical))
(assert_return (invoke "f32.no_fold_div_self" (f32.const 0.0)) (f32.const nan:canonical))
(assert_return (invoke "f32.no_fold_div_self" (f32.const -0.0)) (f32.const nan:canonical))
(assert_return (invoke "f64.no_fold_div_self" (f64.const inf)) (f64.const nan:canonical))
(assert_return (invoke "f64.no_fold_div_self" (f64.const nan)) (f64.const nan:canonical))
(assert_return (invoke "f64.no_fold_div_self" (f64.const 0.0)) (f64.const nan:canonical))
(assert_return (invoke "f64.no_fold_div_self" (f64.const -0.0)) (f64.const nan:canonical))


