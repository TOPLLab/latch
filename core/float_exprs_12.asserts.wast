(assert_return (invoke "f32.no_fold_eq_self" (f32.const nan)) (i32.const 0))
(assert_return (invoke "f64.no_fold_eq_self" (f64.const nan)) (i32.const 0))


