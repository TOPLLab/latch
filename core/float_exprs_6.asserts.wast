(assert_return (invoke "f32.no_fold_mul_one" (f32.const nan:0x200000)) (f32.const nan:arithmetic))
(assert_return (invoke "f64.no_fold_mul_one" (f64.const nan:0x4000000000000)) (f64.const nan:arithmetic))


