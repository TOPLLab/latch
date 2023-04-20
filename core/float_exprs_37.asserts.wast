(assert_return (invoke "no_demote_mixed_add" (f64.const 0x1.f51a9d04854f9p-95) (f32.const 0x1.3f4e9cp-119)) (f32.const 0x1.f51a9ep-95))
(assert_return (invoke "no_demote_mixed_add" (f64.const 0x1.065b3d81ad8dp+37) (f32.const 0x1.758cd8p+38)) (f32.const 0x1.f8ba76p+38))
(assert_return (invoke "no_demote_mixed_add" (f64.const 0x1.626c80963bd17p-119) (f32.const -0x1.9bbf86p-121)) (f32.const 0x1.f6f93ep-120))
(assert_return (invoke "no_demote_mixed_add" (f64.const -0x1.0d5110e3385bbp-20) (f32.const 0x1.096f4ap-29)) (f32.const -0x1.0ccc5ap-20))
(assert_return (invoke "no_demote_mixed_add" (f64.const -0x1.73852db4e5075p-20) (f32.const -0x1.24e474p-41)) (f32.const -0x1.738536p-20))

(assert_return (invoke "no_demote_mixed_add_commuted" (f32.const 0x1.3f4e9cp-119) (f64.const 0x1.f51a9d04854f9p-95)) (f32.const 0x1.f51a9ep-95))
(assert_return (invoke "no_demote_mixed_add_commuted" (f32.const 0x1.758cd8p+38) (f64.const 0x1.065b3d81ad8dp+37)) (f32.const 0x1.f8ba76p+38))
(assert_return (invoke "no_demote_mixed_add_commuted" (f32.const -0x1.9bbf86p-121) (f64.const 0x1.626c80963bd17p-119)) (f32.const 0x1.f6f93ep-120))
(assert_return (invoke "no_demote_mixed_add_commuted" (f32.const 0x1.096f4ap-29) (f64.const -0x1.0d5110e3385bbp-20)) (f32.const -0x1.0ccc5ap-20))
(assert_return (invoke "no_demote_mixed_add_commuted" (f32.const -0x1.24e474p-41) (f64.const -0x1.73852db4e5075p-20)) (f32.const -0x1.738536p-20))


