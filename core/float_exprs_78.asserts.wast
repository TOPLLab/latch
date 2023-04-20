(assert_return (invoke "f32.no_distribute_exact" (f32.const -0.0)) (f32.const 0.0))
(assert_return (invoke "f64.no_distribute_exact" (f64.const -0.0)) (f64.const 0.0))

