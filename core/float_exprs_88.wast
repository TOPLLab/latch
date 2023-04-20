(module
  (func (export "dot_product_example")
        (param $x0 f64) (param $x1 f64) (param $x2 f64) (param $x3 f64)
        (param $y0 f64) (param $y1 f64) (param $y2 f64) (param $y3 f64)
        (result f64)
    (f64.add (f64.add (f64.add
      (f64.mul (local.get $x0) (local.get $y0))
      (f64.mul (local.get $x1) (local.get $y1)))
      (f64.mul (local.get $x2) (local.get $y2)))
      (f64.mul (local.get $x3) (local.get $y3)))
  )

  (func (export "with_binary_sum_collapse")
        (param $x0 f64) (param $x1 f64) (param $x2 f64) (param $x3 f64)
        (param $y0 f64) (param $y1 f64) (param $y2 f64) (param $y3 f64)
        (result f64)
      (f64.add (f64.add (f64.mul (local.get $x0) (local.get $y0))
                        (f64.mul (local.get $x1) (local.get $y1)))
               (f64.add (f64.mul (local.get $x2) (local.get $y2))
                        (f64.mul (local.get $x3) (local.get $y3))))
  )
)

