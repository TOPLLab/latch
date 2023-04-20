(assert_return (invoke "as-block-value"))
(assert_return (invoke "as-loop-value"))

(assert_return (invoke "as-br-value"))
(assert_return (invoke "as-br_if-value"))
(assert_return (invoke "as-br_if-value-cond"))
(assert_return (invoke "as-br_table-value"))

(assert_return (invoke "as-return-value"))

(assert_return (invoke "as-if-then"))
(assert_return (invoke "as-if-else"))

