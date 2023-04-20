(assert_return (invoke "funcref" (ref.null func)) (i32.const 1))
(assert_return (invoke "externref" (ref.null extern)) (i32.const 1))

(assert_return (invoke "externref" (ref.extern 1)) (i32.const 0))

(assert_return (invoke "funcref-elem" (i32.const 0)) (i32.const 1))
(assert_return (invoke "externref-elem" (i32.const 0)) (i32.const 1))

(assert_return (invoke "funcref-elem" (i32.const 1)) (i32.const 0))
(assert_return (invoke "externref-elem" (i32.const 1)) (i32.const 0))

(assert_return (invoke "funcref-elem" (i32.const 0)) (i32.const 1))
(assert_return (invoke "externref-elem" (i32.const 0)) (i32.const 1))

(assert_return (invoke "funcref-elem" (i32.const 1)) (i32.const 1))
(assert_return (invoke "externref-elem" (i32.const 1)) (i32.const 1))

