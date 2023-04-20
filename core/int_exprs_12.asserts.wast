(assert_return (invoke "i32.div_s_3" (i32.const 71)) (i32.const 23))
(assert_return (invoke "i32.div_s_3" (i32.const 0x60000000)) (i32.const 0x20000000))
(assert_return (invoke "i32.div_u_3" (i32.const 71)) (i32.const 23))
(assert_return (invoke "i32.div_u_3" (i32.const 0xc0000000)) (i32.const 0x40000000))
(assert_return (invoke "i64.div_s_3" (i64.const 71)) (i64.const 23))
(assert_return (invoke "i64.div_s_3" (i64.const 0x3000000000000000)) (i64.const 0x1000000000000000))
(assert_return (invoke "i64.div_u_3" (i64.const 71)) (i64.const 23))
(assert_return (invoke "i64.div_u_3" (i64.const 0xc000000000000000)) (i64.const 0x4000000000000000))


