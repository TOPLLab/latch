(module
  (memory 1)
  (data (i32.const 0) "ABC\a7D") (data (i32.const 20) "WASM")

  ;; Data section
  (func (export "data") (result i32)
    (i32.and
      (i32.and
        (i32.and
          (i32.eq (i32.load8_u (i32.const 0)) (i32.const 65))
          (i32.eq (i32.load8_u (i32.const 3)) (i32.const 167))
        )
        (i32.and
          (i32.eq (i32.load8_u (i32.const 6)) (i32.const 0))
          (i32.eq (i32.load8_u (i32.const 19)) (i32.const 0))
        )
      )
      (i32.and
        (i32.and
          (i32.eq (i32.load8_u (i32.const 20)) (i32.const 87))
          (i32.eq (i32.load8_u (i32.const 23)) (i32.const 77))
        )
        (i32.and
          (i32.eq (i32.load8_u (i32.const 24)) (i32.const 0))
          (i32.eq (i32.load8_u (i32.const 1023)) (i32.const 0))
        )
      )
    )
  )

  ;; Memory cast
  (func (export "cast") (result f64)
    (i64.store (i32.const 8) (i64.const -12345))
    (if
      (f64.eq
        (f64.load (i32.const 8))
        (f64.reinterpret_i64 (i64.const -12345))
      )
      (then (return (f64.const 0)))
    )
    (i64.store align=1 (i32.const 9) (i64.const 0))
    (i32.store16 align=1 (i32.const 15) (i32.const 16453))
    (f64.load align=1 (i32.const 9))
  )

  ;; Sign and zero extending memory loads
  (func (export "i32_load8_s") (param $i i32) (result i32)
	(i32.store8 (i32.const 8) (local.get $i))
	(i32.load8_s (i32.const 8))
  )
  (func (export "i32_load8_u") (param $i i32) (result i32)
	(i32.store8 (i32.const 8) (local.get $i))
	(i32.load8_u (i32.const 8))
  )
  (func (export "i32_load16_s") (param $i i32) (result i32)
	(i32.store16 (i32.const 8) (local.get $i))
	(i32.load16_s (i32.const 8))
  )
  (func (export "i32_load16_u") (param $i i32) (result i32)
	(i32.store16 (i32.const 8) (local.get $i))
	(i32.load16_u (i32.const 8))
  )
  (func (export "i64_load8_s") (param $i i64) (result i64)
	(i64.store8 (i32.const 8) (local.get $i))
	(i64.load8_s (i32.const 8))
  )
  (func (export "i64_load8_u") (param $i i64) (result i64)
	(i64.store8 (i32.const 8) (local.get $i))
	(i64.load8_u (i32.const 8))
  )
  (func (export "i64_load16_s") (param $i i64) (result i64)
	(i64.store16 (i32.const 8) (local.get $i))
	(i64.load16_s (i32.const 8))
  )
  (func (export "i64_load16_u") (param $i i64) (result i64)
	(i64.store16 (i32.const 8) (local.get $i))
	(i64.load16_u (i32.const 8))
  )
  (func (export "i64_load32_s") (param $i i64) (result i64)
	(i64.store32 (i32.const 8) (local.get $i))
	(i64.load32_s (i32.const 8))
  )
  (func (export "i64_load32_u") (param $i i64) (result i64)
	(i64.store32 (i32.const 8) (local.get $i))
	(i64.load32_u (i32.const 8))
  )
)

