(assert_return (invoke "check" (i32.const  0)) (f64.const 15.1))
(assert_return (invoke "check" (i32.const  8)) (f64.const 15.2))
(assert_return (invoke "check" (i32.const 16)) (f64.const 15.3))
(assert_return (invoke "check" (i32.const 24)) (f64.const 15.4))
(assert_return (invoke "check" (i32.const 0)) (f64.const 0x1.4222222222222p+2))
(assert_return (invoke "check" (i32.const 8)) (f64.const 0x1.4444444444444p+2))
(assert_return (invoke "check" (i32.const 16)) (f64.const 0x1.4666666666667p+2))
(assert_return (invoke "check" (i32.const 24)) (f64.const 0x1.4888888888889p+2))


