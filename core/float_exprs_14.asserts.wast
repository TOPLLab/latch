(assert_return (invoke "f32.no_fold_sub_self" (f32.const inf)) (f32.const nan:canonical))
(assert_return (invoke "f32.no_fold_sub_self" (f32.const nan)) (f32.const nan:canonical))
(assert_return (invoke "f64.no_fold_sub_self" (f64.const inf)) (f64.const nan:canonical))
(assert_return (invoke "f64.no_fold_sub_self" (f64.const nan)) (f64.const nan:canonical))


