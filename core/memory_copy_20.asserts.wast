(assert_return (invoke "checkRange" (i32.const 0) (i32.const 10) (i32.const 0))
               (i32.const -1))
(assert_return (invoke "checkRange" (i32.const 10) (i32.const 21) (i32.const 85))
               (i32.const -1))
(assert_return (invoke "checkRange" (i32.const 21) (i32.const 65536) (i32.const 0))
               (i32.const -1))

