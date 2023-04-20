(assert_return (invoke "i32.div_s_5" (i32.const 71)) (i32.const 14))
(assert_return (invoke "i32.div_s_5" (i32.const 0x50000000)) (i32.const 0x10000000))
(assert_return (invoke "i32.div_u_5" (i32.const 71)) (i32.const 14))
(assert_return (invoke "i32.div_u_5" (i32.const 0xa0000000)) (i32.const 0x20000000))
(assert_return (invoke "i64.div_s_5" (i64.const 71)) (i64.const 14))
(assert_return (invoke "i64.div_s_5" (i64.const 0x5000000000000000)) (i64.const 0x1000000000000000))
(assert_return (invoke "i64.div_u_5" (i64.const 71)) (i64.const 14))
(assert_return (invoke "i64.div_u_5" (i64.const 0xa000000000000000)) (i64.const 0x2000000000000000))


