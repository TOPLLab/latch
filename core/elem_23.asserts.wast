(assert_trap (invoke $module1 "call-7") "uninitialized element")
(assert_return (invoke $module1 "call-8") (i32.const 65))
(assert_return (invoke $module1 "call-9") (i32.const 66))

