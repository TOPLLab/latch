(assert_return (invoke "f32.no_flush_intermediate_subnormal" (f32.const 0x1p-126) (f32.const 0x1p-23) (f32.const 0x1p23)) (f32.const 0x1p-126))
(assert_return (invoke "f64.no_flush_intermediate_subnormal" (f64.const 0x1p-1022) (f64.const 0x1p-52) (f64.const 0x1p52)) (f64.const 0x1p-1022))


