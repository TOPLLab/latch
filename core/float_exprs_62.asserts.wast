(assert_return (invoke "f64.kahan_sum" (i32.const 0) (i32.const 256)) (f64.const 0x1.dd7cb2a5ffc88p+998))
(assert_return (invoke "f64.plain_sum" (i32.const 0) (i32.const 256)) (f64.const 0x1.dd7cb2a63fc87p+998))


