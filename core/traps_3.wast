(module
    (memory 1)

    (func (export "no_dce.i32.load") (param $i i32) (drop (i32.load (local.get $i))))
    (func (export "no_dce.i32.load16_s") (param $i i32) (drop (i32.load16_s (local.get $i))))
    (func (export "no_dce.i32.load16_u") (param $i i32) (drop (i32.load16_u (local.get $i))))
    (func (export "no_dce.i32.load8_s") (param $i i32) (drop (i32.load8_s (local.get $i))))
    (func (export "no_dce.i32.load8_u") (param $i i32) (drop (i32.load8_u (local.get $i))))
    (func (export "no_dce.i64.load") (param $i i32) (drop (i64.load (local.get $i))))
    (func (export "no_dce.i64.load32_s") (param $i i32) (drop (i64.load32_s (local.get $i))))
    (func (export "no_dce.i64.load32_u") (param $i i32) (drop (i64.load32_u (local.get $i))))
    (func (export "no_dce.i64.load16_s") (param $i i32) (drop (i64.load16_s (local.get $i))))
    (func (export "no_dce.i64.load16_u") (param $i i32) (drop (i64.load16_u (local.get $i))))
    (func (export "no_dce.i64.load8_s") (param $i i32) (drop (i64.load8_s (local.get $i))))
    (func (export "no_dce.i64.load8_u") (param $i i32) (drop (i64.load8_u (local.get $i))))
    (func (export "no_dce.f32.load") (param $i i32) (drop (f32.load (local.get $i))))
    (func (export "no_dce.f64.load") (param $i i32) (drop (f64.load (local.get $i))))
)

