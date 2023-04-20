(assert_return (invoke "f32.no_fold_neg1_mul" (f32.const nan:0x200000)) (f32.const nan:arithmetic))
(assert_return (invoke "f64.no_fold_neg1_mul" (f64.const nan:0x4000000000000)) (f64.const nan:arithmetic))


