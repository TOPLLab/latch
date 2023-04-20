(assert_return (invoke "f32.no_fold_div2_mul2" (f32.const 0x1.fffffep-126)) (f32.const 0x1p-125))
(assert_return (invoke "f64.no_fold_div2_mul2" (f64.const 0x1.fffffffffffffp-1022)) (f64.const 0x1p-1021))


