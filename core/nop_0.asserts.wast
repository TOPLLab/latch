(assert_return (invoke "as-func-first") (i32.const 1))
(assert_return (invoke "as-func-mid") (i32.const 2))
(assert_return (invoke "as-func-last") (i32.const 3))
(assert_return (invoke "as-func-everywhere") (i32.const 4))

(assert_return (invoke "as-drop-first" (i32.const 0)))
(assert_return (invoke "as-drop-last" (i32.const 0)))
(assert_return (invoke "as-drop-everywhere" (i32.const 0)))

(assert_return (invoke "as-select-first" (i32.const 3)) (i32.const 3))
(assert_return (invoke "as-select-mid1" (i32.const 3)) (i32.const 3))
(assert_return (invoke "as-select-mid2" (i32.const 3)) (i32.const 3))
(assert_return (invoke "as-select-last" (i32.const 3)) (i32.const 3))
(assert_return (invoke "as-select-everywhere" (i32.const 3)) (i32.const 3))

(assert_return (invoke "as-block-first") (i32.const 2))
(assert_return (invoke "as-block-mid") (i32.const 2))
(assert_return (invoke "as-block-last") (i32.const 3))
(assert_return (invoke "as-block-everywhere") (i32.const 4))

(assert_return (invoke "as-loop-first") (i32.const 2))
(assert_return (invoke "as-loop-mid") (i32.const 2))
(assert_return (invoke "as-loop-last") (i32.const 3))
(assert_return (invoke "as-loop-everywhere") (i32.const 4))

(assert_return (invoke "as-if-condition" (i32.const 0)))
(assert_return (invoke "as-if-condition" (i32.const -1)))
(assert_return (invoke "as-if-then" (i32.const 0)))
(assert_return (invoke "as-if-then" (i32.const 4)))
(assert_return (invoke "as-if-else" (i32.const 0)))
(assert_return (invoke "as-if-else" (i32.const 3)))

(assert_return (invoke "as-br-first" (i32.const 5)) (i32.const 5))
(assert_return (invoke "as-br-last" (i32.const 6)) (i32.const 6))
(assert_return (invoke "as-br-everywhere" (i32.const 7)) (i32.const 7))

(assert_return (invoke "as-br_if-first" (i32.const 4)) (i32.const 4))
(assert_return (invoke "as-br_if-mid" (i32.const 5)) (i32.const 5))
(assert_return (invoke "as-br_if-last" (i32.const 6)) (i32.const 6))
(assert_return (invoke "as-br_if-everywhere" (i32.const 7)) (i32.const 7))

(assert_return (invoke "as-br_table-first" (i32.const 4)) (i32.const 4))
(assert_return (invoke "as-br_table-mid" (i32.const 5)) (i32.const 5))
(assert_return (invoke "as-br_table-last" (i32.const 6)) (i32.const 6))
(assert_return (invoke "as-br_table-everywhere" (i32.const 7)) (i32.const 7))

(assert_return (invoke "as-return-first" (i32.const 5)) (i32.const 5))
(assert_return (invoke "as-return-last" (i32.const 6)) (i32.const 6))
(assert_return (invoke "as-return-everywhere" (i32.const 7)) (i32.const 7))

(assert_return (invoke "as-call-first" (i32.const 3) (i32.const 1) (i32.const 2)) (i32.const 2))
(assert_return (invoke "as-call-mid1" (i32.const 3) (i32.const 1) (i32.const 2)) (i32.const 2))
(assert_return (invoke "as-call-mid2" (i32.const 0) (i32.const 3) (i32.const 1)) (i32.const 2))
(assert_return (invoke "as-call-last" (i32.const 10) (i32.const 9) (i32.const -1)) (i32.const 20))
(assert_return (invoke "as-call-everywhere" (i32.const 2) (i32.const 1) (i32.const 5)) (i32.const -2))

(assert_return (invoke "as-unary-first" (i32.const 30)) (i32.const 1))
(assert_return (invoke "as-unary-last" (i32.const 30)) (i32.const 1))
(assert_return (invoke "as-unary-everywhere" (i32.const 12)) (i32.const 2))

(assert_return (invoke "as-binary-first" (i32.const 3)) (i32.const 6))
(assert_return (invoke "as-binary-mid" (i32.const 3)) (i32.const 6))
(assert_return (invoke "as-binary-last" (i32.const 3)) (i32.const 6))
(assert_return (invoke "as-binary-everywhere" (i32.const 3)) (i32.const 6))

(assert_return (invoke "as-test-first" (i32.const 0)) (i32.const 1))
(assert_return (invoke "as-test-last" (i32.const 0)) (i32.const 1))
(assert_return (invoke "as-test-everywhere" (i32.const 0)) (i32.const 1))

(assert_return (invoke "as-compare-first" (i32.const 3)) (i32.const 0))
(assert_return (invoke "as-compare-mid" (i32.const 3)) (i32.const 0))
(assert_return (invoke "as-compare-last" (i32.const 3)) (i32.const 0))
(assert_return (invoke "as-compare-everywhere" (i32.const 3)) (i32.const 1))

(assert_return (invoke "as-memory.grow-first" (i32.const 0)) (i32.const 1))
(assert_return (invoke "as-memory.grow-last" (i32.const 2)) (i32.const 1))
(assert_return (invoke "as-memory.grow-everywhere" (i32.const 12)) (i32.const 3))

(assert_return (invoke "as-call_indirect-first") (i32.const 1))
(assert_return (invoke "as-call_indirect-mid1") (i32.const 1))
(assert_return (invoke "as-call_indirect-mid2") (i32.const 1))
(assert_return (invoke "as-call_indirect-last") (i32.const 1))
(assert_return (invoke "as-call_indirect-everywhere") (i32.const 1))

(assert_return (invoke "as-local.set-first" (i32.const 1)) (i32.const 2))
(assert_return (invoke "as-local.set-last" (i32.const 1)) (i32.const 2))
(assert_return (invoke "as-local.set-everywhere" (i32.const 1)) (i32.const 2))

(assert_return (invoke "as-local.tee-first" (i32.const 1)) (i32.const 2))
(assert_return (invoke "as-local.tee-last" (i32.const 1)) (i32.const 2))
(assert_return (invoke "as-local.tee-everywhere" (i32.const 1)) (i32.const 2))

(assert_return (invoke "as-global.set-first") (i32.const 2))
(assert_return (invoke "as-global.set-last") (i32.const 2))
(assert_return (invoke "as-global.set-everywhere") (i32.const 2))

(assert_return (invoke "as-load-first" (i32.const 100)) (i32.const 0))
(assert_return (invoke "as-load-last" (i32.const 100)) (i32.const 0))
(assert_return (invoke "as-load-everywhere" (i32.const 100)) (i32.const 0))

(assert_return (invoke "as-store-first" (i32.const 0) (i32.const 1)))
(assert_return (invoke "as-store-mid" (i32.const 0) (i32.const 2)))
(assert_return (invoke "as-store-last" (i32.const 0) (i32.const 3)))
(assert_return (invoke "as-store-everywhere" (i32.const 0) (i32.const 4)))

