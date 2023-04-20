(assert_return (invoke "thepast0" (f64.const 0x1p-1021) (f64.const 0x1.fffffffffffffp-1) (f64.const 0x1p1) (f64.const 0x1p-1)) (f64.const 0x1.fffffffffffffp-1022))
(assert_return (invoke "thepast1" (f64.const 0x1p-54) (f64.const 0x1.fffffffffffffp-1) (f64.const 0x1p-54)) (f64.const -0x1p-107))
(assert_return (invoke "thepast2" (f32.const 0x1p-125) (f32.const 0x1p-1) (f32.const 0x1p0)) (f32.const 0x1p-126))


