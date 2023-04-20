(assert_return (invoke "checkRange" (i32.const 0) (i32.const 65536) (i32.const 0))
               (i32.const -1))
