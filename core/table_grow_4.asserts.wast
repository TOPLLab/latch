(assert_return (invoke "check-table-null" (i32.const 0) (i32.const 9)) (ref.null func))
(assert_return (invoke "grow" (i32.const 10)) (i32.const 10))
(assert_return (invoke "check-table-null" (i32.const 0) (i32.const 19)) (ref.null func))



