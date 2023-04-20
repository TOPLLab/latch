(assert_return (invoke "f32.golden_ratio" (f32.const 0.5) (f32.const 1.0) (f32.const 5.0)) (f32.const 1.618034))
(assert_return (invoke "f64.golden_ratio" (f64.const 0.5) (f64.const 1.0) (f64.const 5.0)) (f64.const 1.618033988749895))


