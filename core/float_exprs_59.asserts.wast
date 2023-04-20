(assert_return (invoke "f32.simple_x4_sum" (i32.const 0) (i32.const 16) (i32.const 32)))
(assert_return (invoke "f32.load" (i32.const 32)) (f32.const 0x1p-148))
(assert_return (invoke "f32.load" (i32.const 36)) (f32.const 0x0p+0))
(assert_return (invoke "f32.load" (i32.const 40)) (f32.const 0x1p-149))
(assert_return (invoke "f32.load" (i32.const 44)) (f32.const -0x1p-149))

