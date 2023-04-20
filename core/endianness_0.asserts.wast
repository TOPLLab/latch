(assert_return (invoke "i32_load16_s" (i32.const -1)) (i32.const -1))
(assert_return (invoke "i32_load16_s" (i32.const -4242)) (i32.const -4242))
(assert_return (invoke "i32_load16_s" (i32.const 42)) (i32.const 42))
(assert_return (invoke "i32_load16_s" (i32.const 0x3210)) (i32.const 0x3210))

(assert_return (invoke "i32_load16_u" (i32.const -1)) (i32.const 0xFFFF))
(assert_return (invoke "i32_load16_u" (i32.const -4242)) (i32.const 61294))
(assert_return (invoke "i32_load16_u" (i32.const 42)) (i32.const 42))
(assert_return (invoke "i32_load16_u" (i32.const 0xCAFE)) (i32.const 0xCAFE))

(assert_return (invoke "i32_load" (i32.const -1)) (i32.const -1))
(assert_return (invoke "i32_load" (i32.const -42424242)) (i32.const -42424242))
(assert_return (invoke "i32_load" (i32.const 42424242)) (i32.const 42424242))
(assert_return (invoke "i32_load" (i32.const 0xABAD1DEA)) (i32.const 0xABAD1DEA))

(assert_return (invoke "i64_load16_s" (i64.const -1)) (i64.const -1))
(assert_return (invoke "i64_load16_s" (i64.const -4242)) (i64.const -4242))
(assert_return (invoke "i64_load16_s" (i64.const 42)) (i64.const 42))
(assert_return (invoke "i64_load16_s" (i64.const 0x3210)) (i64.const 0x3210))

(assert_return (invoke "i64_load16_u" (i64.const -1)) (i64.const 0xFFFF))
(assert_return (invoke "i64_load16_u" (i64.const -4242)) (i64.const 61294))
(assert_return (invoke "i64_load16_u" (i64.const 42)) (i64.const 42))
(assert_return (invoke "i64_load16_u" (i64.const 0xCAFE)) (i64.const 0xCAFE))

(assert_return (invoke "i64_load32_s" (i64.const -1)) (i64.const -1))
(assert_return (invoke "i64_load32_s" (i64.const -42424242)) (i64.const -42424242))
(assert_return (invoke "i64_load32_s" (i64.const 42424242)) (i64.const 42424242))
(assert_return (invoke "i64_load32_s" (i64.const 0x12345678)) (i64.const 0x12345678))

(assert_return (invoke "i64_load32_u" (i64.const -1)) (i64.const 0xFFFFFFFF))
(assert_return (invoke "i64_load32_u" (i64.const -42424242)) (i64.const 4252543054))
(assert_return (invoke "i64_load32_u" (i64.const 42424242)) (i64.const 42424242))
(assert_return (invoke "i64_load32_u" (i64.const 0xABAD1DEA)) (i64.const 0xABAD1DEA))

(assert_return (invoke "i64_load" (i64.const -1)) (i64.const -1))
(assert_return (invoke "i64_load" (i64.const -42424242)) (i64.const -42424242))
(assert_return (invoke "i64_load" (i64.const 0xABAD1DEA)) (i64.const 0xABAD1DEA))
(assert_return (invoke "i64_load" (i64.const 0xABADCAFEDEAD1DEA)) (i64.const 0xABADCAFEDEAD1DEA))

(assert_return (invoke "f32_load" (f32.const -1)) (f32.const -1))
(assert_return (invoke "f32_load" (f32.const 1234e-5)) (f32.const 1234e-5))
(assert_return (invoke "f32_load" (f32.const 4242.4242)) (f32.const 4242.4242))
(assert_return (invoke "f32_load" (f32.const 0x1.fffffep+127)) (f32.const 0x1.fffffep+127))

(assert_return (invoke "f64_load" (f64.const -1)) (f64.const -1))
(assert_return (invoke "f64_load" (f64.const 123456789e-5)) (f64.const 123456789e-5))
(assert_return (invoke "f64_load" (f64.const 424242.424242)) (f64.const 424242.424242))
(assert_return (invoke "f64_load" (f64.const 0x1.fffffffffffffp+1023)) (f64.const 0x1.fffffffffffffp+1023))


(assert_return (invoke "i32_store16" (i32.const -1)) (i32.const 0xFFFF))
(assert_return (invoke "i32_store16" (i32.const -4242)) (i32.const 61294))
(assert_return (invoke "i32_store16" (i32.const 42)) (i32.const 42))
(assert_return (invoke "i32_store16" (i32.const 0xCAFE)) (i32.const 0xCAFE))

(assert_return (invoke "i32_store" (i32.const -1)) (i32.const -1))
(assert_return (invoke "i32_store" (i32.const -4242)) (i32.const -4242))
(assert_return (invoke "i32_store" (i32.const 42424242)) (i32.const 42424242))
(assert_return (invoke "i32_store" (i32.const 0xDEADCAFE)) (i32.const 0xDEADCAFE))

(assert_return (invoke "i64_store16" (i64.const -1)) (i64.const 0xFFFF))
(assert_return (invoke "i64_store16" (i64.const -4242)) (i64.const 61294))
(assert_return (invoke "i64_store16" (i64.const 42)) (i64.const 42))
(assert_return (invoke "i64_store16" (i64.const 0xCAFE)) (i64.const 0xCAFE))

(assert_return (invoke "i64_store32" (i64.const -1)) (i64.const 0xFFFFFFFF))
(assert_return (invoke "i64_store32" (i64.const -4242)) (i64.const 4294963054))
(assert_return (invoke "i64_store32" (i64.const 42424242)) (i64.const 42424242))
(assert_return (invoke "i64_store32" (i64.const 0xDEADCAFE)) (i64.const 0xDEADCAFE))

(assert_return (invoke "i64_store" (i64.const -1)) (i64.const -1))
(assert_return (invoke "i64_store" (i64.const -42424242)) (i64.const -42424242))
(assert_return (invoke "i64_store" (i64.const 0xABAD1DEA)) (i64.const 0xABAD1DEA))
(assert_return (invoke "i64_store" (i64.const 0xABADCAFEDEAD1DEA)) (i64.const 0xABADCAFEDEAD1DEA))

(assert_return (invoke "f32_store" (f32.const -1)) (f32.const -1))
(assert_return (invoke "f32_store" (f32.const 1234e-5)) (f32.const 1234e-5))
(assert_return (invoke "f32_store" (f32.const 4242.4242)) (f32.const 4242.4242))
(assert_return (invoke "f32_store" (f32.const 0x1.fffffep+127)) (f32.const 0x1.fffffep+127))

(assert_return (invoke "f64_store" (f64.const -1)) (f64.const -1))
(assert_return (invoke "f64_store" (f64.const 123456789e-5)) (f64.const 123456789e-5))
(assert_return (invoke "f64_store" (f64.const 424242.424242)) (f64.const 424242.424242))
(assert_return (invoke "f64_store" (f64.const 0x1.fffffffffffffp+1023)) (f64.const 0x1.fffffffffffffp+1023))
