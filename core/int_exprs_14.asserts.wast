(assert_return (invoke "i32.div_s_7" (i32.const 71)) (i32.const 10))
(assert_return (invoke "i32.div_s_7" (i32.const 0x70000000)) (i32.const 0x10000000))
(assert_return (invoke "i32.div_u_7" (i32.const 71)) (i32.const 10))
(assert_return (invoke "i32.div_u_7" (i32.const 0xe0000000)) (i32.const 0x20000000))
(assert_return (invoke "i64.div_s_7" (i64.const 71)) (i64.const 10))
(assert_return (invoke "i64.div_s_7" (i64.const 0x7000000000000000)) (i64.const 0x1000000000000000))
(assert_return (invoke "i64.div_u_7" (i64.const 71)) (i64.const 10))
(assert_return (invoke "i64.div_u_7" (i64.const 0xe000000000000000)) (i64.const 0x2000000000000000))


