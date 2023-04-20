(assert_return (invoke "f64.simple_x4_sum" (i32.const 0) (i32.const 32) (i32.const 64)))
(assert_return (invoke "f64.load" (i32.const 64)) (f64.const 0x0.0000000000001p-1021))
(assert_return (invoke "f64.load" (i32.const 72)) (f64.const 0x0p+0))
(assert_return (invoke "f64.load" (i32.const 80)) (f64.const 0x0.0000000000001p-1022))
(assert_return (invoke "f64.load" (i32.const 88)) (f64.const -0x0.0000000000001p-1022))


