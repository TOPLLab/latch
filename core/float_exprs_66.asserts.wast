(assert_return (invoke "f32.no_fold_add_neg" (f32.const 0.0)) (f32.const 0.0))
(assert_return (invoke "f32.no_fold_add_neg" (f32.const -0.0)) (f32.const 0.0))
(assert_return (invoke "f32.no_fold_add_neg" (f32.const inf)) (f32.const nan:canonical))
(assert_return (invoke "f32.no_fold_add_neg" (f32.const -inf)) (f32.const nan:canonical))

(assert_return (invoke "f64.no_fold_add_neg" (f64.const 0.0)) (f64.const 0.0))
(assert_return (invoke "f64.no_fold_add_neg" (f64.const -0.0)) (f64.const 0.0))
(assert_return (invoke "f64.no_fold_add_neg" (f64.const inf)) (f64.const nan:canonical))
(assert_return (invoke "f64.no_fold_add_neg" (f64.const -inf)) (f64.const nan:canonical))


