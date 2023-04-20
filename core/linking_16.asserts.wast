(assert_return (invoke $Mm "load" (i32.const 12)) (i32.const 2))
(assert_return (invoke $Nm "Mm.load" (i32.const 12)) (i32.const 2))
(assert_return (invoke $Nm "load" (i32.const 12)) (i32.const 0xf2))

