(assert_return (invoke "f32.no_extended_precision_div" (f32.const 3.0) (f32.const 7.0) (f32.const 0x1.b6db6ep-2)) (i32.const 1))
(assert_return (invoke "f64.no_extended_precision_div" (f64.const 3.0) (f64.const 7.0) (f64.const 0x1.b6db6db6db6dbp-2)) (i32.const 1))


