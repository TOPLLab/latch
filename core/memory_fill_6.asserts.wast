(assert_return (invoke "checkRange" (i32.const 0) (i32.const 1) (i32.const 0))
               (i32.const -1))
(assert_return (invoke "checkRange" (i32.const 1) (i32.const 65535) (i32.const 170))
               (i32.const -1))
(assert_return (invoke "checkRange" (i32.const 65535) (i32.const 65536) (i32.const 0))
               (i32.const -1))

