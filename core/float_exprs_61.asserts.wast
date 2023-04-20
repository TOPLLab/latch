(assert_return (invoke "f32.kahan_sum" (i32.const 0) (i32.const 256)) (f32.const -0x1.101a1ap+104))
(assert_return (invoke "f32.plain_sum" (i32.const 0) (i32.const 256)) (f32.const -0x1.a0343ap+103))

