(assert_return (invoke "fac-expr" (i64.const 25)) (i64.const 7034535277573963776))
(assert_return (invoke "fac-stack" (i64.const 25)) (i64.const 7034535277573963776))
(assert_return (invoke "fac-mixed" (i64.const 25)) (i64.const 7034535277573963776))

(assert_return (invoke "not-quite-a-tree") (i32.const 3))
(assert_return (invoke "not-quite-a-tree") (i32.const 9))



