(assert_trap (invoke "run" (i32.const 65279) (i32.const 37) (i32.const 514))
              "out of bounds memory access")

(assert_return (invoke "checkRange" (i32.const 0) (i32.const 1) (i32.const 0))
               (i32.const -1))
