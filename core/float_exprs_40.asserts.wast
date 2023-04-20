(assert_return (invoke "check" (i32.const  0)) (f32.const 15.1))
(assert_return (invoke "check" (i32.const  4)) (f32.const 15.2))
(assert_return (invoke "check" (i32.const  8)) (f32.const 15.3))
(assert_return (invoke "check" (i32.const 12)) (f32.const 15.4))
(assert_return (invoke "check" (i32.const  0)) (f32.const 0x1.422222p+2))
(assert_return (invoke "check" (i32.const  4)) (f32.const 0x1.444444p+2))
(assert_return (invoke "check" (i32.const  8)) (f32.const 0x1.466666p+2))
(assert_return (invoke "check" (i32.const 12)) (f32.const 0x1.488888p+2))

