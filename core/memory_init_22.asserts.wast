(assert_trap (invoke "run" (i32.const 0) (i32.const 4294967292))
              "out of bounds memory access")

(assert_return (invoke "checkRange" (i32.const 0) (i32.const 1) (i32.const 0))
               (i32.const -1))

