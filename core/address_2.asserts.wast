(assert_return (invoke "32_good1" (i32.const 0)) (f32.const 0.0))
(assert_return (invoke "32_good2" (i32.const 0)) (f32.const 0.0))
(assert_return (invoke "32_good3" (i32.const 0)) (f32.const 0.0))
(assert_return (invoke "32_good4" (i32.const 0)) (f32.const 0.0))
(assert_return (invoke "32_good5" (i32.const 0)) (f32.const nan:0x500001))

(assert_return (invoke "32_good1" (i32.const 65524)) (f32.const 0.0))
(assert_return (invoke "32_good2" (i32.const 65524)) (f32.const 0.0))
(assert_return (invoke "32_good3" (i32.const 65524)) (f32.const 0.0))
(assert_return (invoke "32_good4" (i32.const 65524)) (f32.const 0.0))
(assert_return (invoke "32_good5" (i32.const 65524)) (f32.const 0.0))

(assert_return (invoke "32_good1" (i32.const 65525)) (f32.const 0.0))
(assert_return (invoke "32_good2" (i32.const 65525)) (f32.const 0.0))
(assert_return (invoke "32_good3" (i32.const 65525)) (f32.const 0.0))
(assert_return (invoke "32_good4" (i32.const 65525)) (f32.const 0.0))
(assert_trap (invoke "32_good5" (i32.const 65525)) "out of bounds memory access")

(assert_trap (invoke "32_good3" (i32.const -1)) "out of bounds memory access")
(assert_trap (invoke "32_good3" (i32.const -1)) "out of bounds memory access")

(assert_trap (invoke "32_bad" (i32.const 0)) "out of bounds memory access")
(assert_trap (invoke "32_bad" (i32.const 1)) "out of bounds memory access")


