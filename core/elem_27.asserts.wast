(assert_return (invoke $m "get" (i32.const 0)) (ref.null extern))
(assert_return (invoke $m "get" (i32.const 1)) (ref.extern 137))
