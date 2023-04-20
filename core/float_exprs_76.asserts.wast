(assert_return (invoke "f32.recoding_eq" (f32.const -inf) (f32.const 3.0)) (i32.const 1))
(assert_return (invoke "f32.recoding_le" (f32.const -inf) (f32.const 3.0)) (i32.const 1))
(assert_return (invoke "f32.recoding_lt" (f32.const -inf) (f32.const 3.0)) (i32.const 0))

(assert_return (invoke "f32.recoding_eq" (f32.const 0x0p+0) (f32.const 0x1p+0)) (i32.const 1))
(assert_return (invoke "f32.recoding_le" (f32.const 0x0p+0) (f32.const 0x1p+0)) (i32.const 1))
(assert_return (invoke "f32.recoding_lt" (f32.const 0x0p+0) (f32.const 0x1p+0)) (i32.const 0))

(assert_return (invoke "f64.recoding_eq" (f64.const -inf) (f64.const 3.0)) (i32.const 1))
(assert_return (invoke "f64.recoding_le" (f64.const -inf) (f64.const 3.0)) (i32.const 1))
(assert_return (invoke "f64.recoding_lt" (f64.const -inf) (f64.const 3.0)) (i32.const 0))

(assert_return (invoke "f64.recoding_eq" (f64.const 0x0p+0) (f64.const 0x1p+0)) (i32.const 1))
(assert_return (invoke "f64.recoding_le" (f64.const 0x0p+0) (f64.const 0x1p+0)) (i32.const 1))
(assert_return (invoke "f64.recoding_lt" (f64.const 0x0p+0) (f64.const 0x1p+0)) (i32.const 0))

(assert_return (invoke "recoding_demote" (f64.const 0x1.4c8f8p-132) (f32.const 1221)) (f32.const 0x1.8c8a1cp-122))


