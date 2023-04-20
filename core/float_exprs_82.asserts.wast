(assert_return (invoke "f32.no_fold_add_le_monotonicity" (f32.const 0.0) (f32.const 0.0) (f32.const nan)) (i32.const 0))
(assert_return (invoke "f32.no_fold_add_le_monotonicity" (f32.const inf) (f32.const -inf) (f32.const inf)) (i32.const 0))
(assert_return (invoke "f64.no_fold_add_le_monotonicity" (f64.const 0.0) (f64.const 0.0) (f64.const nan)) (i32.const 0))
(assert_return (invoke "f64.no_fold_add_le_monotonicity" (f64.const inf) (f64.const -inf) (f64.const inf)) (i32.const 0))


