(assert_return (invoke "dot_product_example"
    (f64.const 3.2e7) (f64.const 1.0) (f64.const -1.0) (f64.const 8.0e7)
    (f64.const 4.0e7) (f64.const 1.0) (f64.const -1.0) (f64.const -1.6e7))
  (f64.const 2.0))
(assert_return (invoke "with_binary_sum_collapse"
    (f64.const 3.2e7) (f64.const 1.0) (f64.const -1.0) (f64.const 8.0e7)
    (f64.const 4.0e7) (f64.const 1.0) (f64.const -1.0) (f64.const -1.6e7))
  (f64.const 2.0))


