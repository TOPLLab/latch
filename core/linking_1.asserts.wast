(assert_return (invoke $Mf "call") (i32.const 2))
(assert_return (invoke $Nf "Mf.call") (i32.const 2))
(assert_return (invoke $Nf "call") (i32.const 3))
(assert_return (invoke $Nf "call Mf.call") (i32.const 2))

