(assert_return (invoke "init_passive" (i32.const 0)))
(assert_trap (invoke "init_passive" (i32.const 1)) "out of bounds table access")
(assert_return (invoke "init_active" (i32.const 0)))
(assert_trap (invoke "init_active" (i32.const 1)) "out of bounds table access")
