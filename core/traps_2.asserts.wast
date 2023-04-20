(assert_trap (invoke "no_dce.i32.trunc_f32_s" (f32.const nan)) "invalid conversion to integer")
(assert_trap (invoke "no_dce.i32.trunc_f32_u" (f32.const nan)) "invalid conversion to integer")
(assert_trap (invoke "no_dce.i32.trunc_f64_s" (f64.const nan)) "invalid conversion to integer")
(assert_trap (invoke "no_dce.i32.trunc_f64_u" (f64.const nan)) "invalid conversion to integer")
(assert_trap (invoke "no_dce.i64.trunc_f32_s" (f32.const nan)) "invalid conversion to integer")
(assert_trap (invoke "no_dce.i64.trunc_f32_u" (f32.const nan)) "invalid conversion to integer")
(assert_trap (invoke "no_dce.i64.trunc_f64_s" (f64.const nan)) "invalid conversion to integer")
(assert_trap (invoke "no_dce.i64.trunc_f64_u" (f64.const nan)) "invalid conversion to integer")

