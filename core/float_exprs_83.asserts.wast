(assert_return (invoke "f32.not_lt" (f32.const nan) (f32.const 0.0)) (i32.const 1))
(assert_return (invoke "f32.not_le" (f32.const nan) (f32.const 0.0)) (i32.const 1))
(assert_return (invoke "f32.not_gt" (f32.const nan) (f32.const 0.0)) (i32.const 1))
(assert_return (invoke "f32.not_ge" (f32.const nan) (f32.const 0.0)) (i32.const 1))
(assert_return (invoke "f64.not_lt" (f64.const nan) (f64.const 0.0)) (i32.const 1))
(assert_return (invoke "f64.not_le" (f64.const nan) (f64.const 0.0)) (i32.const 1))
(assert_return (invoke "f64.not_gt" (f64.const nan) (f64.const 0.0)) (i32.const 1))
(assert_return (invoke "f64.not_ge" (f64.const nan) (f64.const 0.0)) (i32.const 1))


