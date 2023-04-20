(assert_return (invoke "i32.no_fold_f32_s" (i32.const 0x1000000)) (i32.const 0x1000000))
(assert_return (invoke "i32.no_fold_f32_s" (i32.const 0x1000001)) (i32.const 0x1000000))
(assert_return (invoke "i32.no_fold_f32_s" (i32.const 0xf0000010)) (i32.const 0xf0000010))

(assert_return (invoke "i32.no_fold_f32_u" (i32.const 0x1000000)) (i32.const 0x1000000))
(assert_return (invoke "i32.no_fold_f32_u" (i32.const 0x1000001)) (i32.const 0x1000000))
(assert_return (invoke "i32.no_fold_f32_u" (i32.const 0xf0000010)) (i32.const 0xf0000000))

(assert_return (invoke "i64.no_fold_f64_s" (i64.const 0x20000000000000)) (i64.const 0x20000000000000))
(assert_return (invoke "i64.no_fold_f64_s" (i64.const 0x20000000000001)) (i64.const 0x20000000000000))
(assert_return (invoke "i64.no_fold_f64_s" (i64.const 0xf000000000000400)) (i64.const 0xf000000000000400))

(assert_return (invoke "i64.no_fold_f64_u" (i64.const 0x20000000000000)) (i64.const 0x20000000000000))
(assert_return (invoke "i64.no_fold_f64_u" (i64.const 0x20000000000001)) (i64.const 0x20000000000000))
(assert_return (invoke "i64.no_fold_f64_u" (i64.const 0xf000000000000400)) (i64.const 0xf000000000000000))


