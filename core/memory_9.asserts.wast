(assert_return (invoke "data") (i32.const 1))
(assert_return (invoke "cast") (f64.const 42.0))

(assert_return (invoke "i32_load8_s" (i32.const -1)) (i32.const -1))
(assert_return (invoke "i32_load8_u" (i32.const -1)) (i32.const 255))
(assert_return (invoke "i32_load16_s" (i32.const -1)) (i32.const -1))
(assert_return (invoke "i32_load16_u" (i32.const -1)) (i32.const 65535))

(assert_return (invoke "i32_load8_s" (i32.const 100)) (i32.const 100))
(assert_return (invoke "i32_load8_u" (i32.const 200)) (i32.const 200))
(assert_return (invoke "i32_load16_s" (i32.const 20000)) (i32.const 20000))
(assert_return (invoke "i32_load16_u" (i32.const 40000)) (i32.const 40000))

(assert_return (invoke "i32_load8_s" (i32.const 0xfedc6543)) (i32.const 0x43))
(assert_return (invoke "i32_load8_s" (i32.const 0x3456cdef)) (i32.const 0xffffffef))
(assert_return (invoke "i32_load8_u" (i32.const 0xfedc6543)) (i32.const 0x43))
(assert_return (invoke "i32_load8_u" (i32.const 0x3456cdef)) (i32.const 0xef))
(assert_return (invoke "i32_load16_s" (i32.const 0xfedc6543)) (i32.const 0x6543))
(assert_return (invoke "i32_load16_s" (i32.const 0x3456cdef)) (i32.const 0xffffcdef))
(assert_return (invoke "i32_load16_u" (i32.const 0xfedc6543)) (i32.const 0x6543))
(assert_return (invoke "i32_load16_u" (i32.const 0x3456cdef)) (i32.const 0xcdef))

(assert_return (invoke "i64_load8_s" (i64.const -1)) (i64.const -1))
(assert_return (invoke "i64_load8_u" (i64.const -1)) (i64.const 255))
(assert_return (invoke "i64_load16_s" (i64.const -1)) (i64.const -1))
(assert_return (invoke "i64_load16_u" (i64.const -1)) (i64.const 65535))
(assert_return (invoke "i64_load32_s" (i64.const -1)) (i64.const -1))
(assert_return (invoke "i64_load32_u" (i64.const -1)) (i64.const 4294967295))

(assert_return (invoke "i64_load8_s" (i64.const 100)) (i64.const 100))
(assert_return (invoke "i64_load8_u" (i64.const 200)) (i64.const 200))
(assert_return (invoke "i64_load16_s" (i64.const 20000)) (i64.const 20000))
(assert_return (invoke "i64_load16_u" (i64.const 40000)) (i64.const 40000))
(assert_return (invoke "i64_load32_s" (i64.const 20000)) (i64.const 20000))
(assert_return (invoke "i64_load32_u" (i64.const 40000)) (i64.const 40000))

(assert_return (invoke "i64_load8_s" (i64.const 0xfedcba9856346543)) (i64.const 0x43))
(assert_return (invoke "i64_load8_s" (i64.const 0x3456436598bacdef)) (i64.const 0xffffffffffffffef))
(assert_return (invoke "i64_load8_u" (i64.const 0xfedcba9856346543)) (i64.const 0x43))
(assert_return (invoke "i64_load8_u" (i64.const 0x3456436598bacdef)) (i64.const 0xef))
(assert_return (invoke "i64_load16_s" (i64.const 0xfedcba9856346543)) (i64.const 0x6543))
(assert_return (invoke "i64_load16_s" (i64.const 0x3456436598bacdef)) (i64.const 0xffffffffffffcdef))
(assert_return (invoke "i64_load16_u" (i64.const 0xfedcba9856346543)) (i64.const 0x6543))
(assert_return (invoke "i64_load16_u" (i64.const 0x3456436598bacdef)) (i64.const 0xcdef))
(assert_return (invoke "i64_load32_s" (i64.const 0xfedcba9856346543)) (i64.const 0x56346543))
(assert_return (invoke "i64_load32_s" (i64.const 0x3456436598bacdef)) (i64.const 0xffffffff98bacdef))
(assert_return (invoke "i64_load32_u" (i64.const 0xfedcba9856346543)) (i64.const 0x56346543))
(assert_return (invoke "i64_load32_u" (i64.const 0x3456436598bacdef)) (i64.const 0x98bacdef))


