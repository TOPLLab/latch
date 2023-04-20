(assert_return (invoke "i64.no_fold_wrap_extend_s" (i64.const 0x0010203040506070)) (i64.const 0x0000000040506070))
(assert_return (invoke "i64.no_fold_wrap_extend_s" (i64.const 0x00a0b0c0d0e0f0a0)) (i64.const 0xffffffffd0e0f0a0))


