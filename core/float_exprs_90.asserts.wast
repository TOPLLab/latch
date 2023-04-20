(assert_return (invoke "f32.division_by_small_number" (f32.const 112000000) (f32.const 100000) (f32.const 0.0009)) (f32.const 888888))
(assert_return (invoke "f64.division_by_small_number" (f64.const 112000000) (f64.const 100000) (f64.const 0.0009)) (f64.const 888888.8888888806))


