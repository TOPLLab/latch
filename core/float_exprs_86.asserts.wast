(assert_return (invoke "f32.no_trichotomy_lt" (f32.const 0.0) (f32.const nan)) (i32.const 0))
(assert_return (invoke "f32.no_trichotomy_le" (f32.const 0.0) (f32.const nan)) (i32.const 0))
(assert_return (invoke "f32.no_trichotomy_gt" (f32.const 0.0) (f32.const nan)) (i32.const 0))
(assert_return (invoke "f32.no_trichotomy_ge" (f32.const 0.0) (f32.const nan)) (i32.const 0))
(assert_return (invoke "f64.no_trichotomy_lt" (f64.const 0.0) (f64.const nan)) (i32.const 0))
(assert_return (invoke "f64.no_trichotomy_le" (f64.const 0.0) (f64.const nan)) (i32.const 0))
(assert_return (invoke "f64.no_trichotomy_gt" (f64.const 0.0) (f64.const nan)) (i32.const 0))
(assert_return (invoke "f64.no_trichotomy_ge" (f64.const 0.0) (f64.const nan)) (i32.const 0))

