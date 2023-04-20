(assert_return (invoke "f32.no_fold_recip_recip" (f32.const -0x1.e8bf18p+65)) (f32.const -0x1.e8bf16p+65))
(assert_return (invoke "f32.no_fold_recip_recip" (f32.const 0x1.e24248p-77)) (f32.const 0x1.e24246p-77))
(assert_return (invoke "f32.no_fold_recip_recip" (f32.const 0x1.caf0e8p-64)) (f32.const 0x1.caf0eap-64))
(assert_return (invoke "f32.no_fold_recip_recip" (f32.const -0x1.e66982p+4)) (f32.const -0x1.e66984p+4))
(assert_return (invoke "f32.no_fold_recip_recip" (f32.const 0x1.f99916p+70)) (f32.const 0x1.f99914p+70))

(assert_return (invoke "f32.no_fold_recip_recip" (f32.const -0x0p+0)) (f32.const -0x0p+0))
(assert_return (invoke "f32.no_fold_recip_recip" (f32.const 0x0p+0)) (f32.const 0x0p+0))
(assert_return (invoke "f32.no_fold_recip_recip" (f32.const -inf)) (f32.const -inf))
(assert_return (invoke "f32.no_fold_recip_recip" (f32.const inf)) (f32.const inf))

(assert_return (invoke "f64.no_fold_recip_recip" (f64.const -0x1.d81248dda63dp+148)) (f64.const -0x1.d81248dda63d1p+148))
(assert_return (invoke "f64.no_fold_recip_recip" (f64.const -0x1.f4750312039e3p+66)) (f64.const -0x1.f4750312039e2p+66))
(assert_return (invoke "f64.no_fold_recip_recip" (f64.const 0x1.fa50630eec7f6p+166)) (f64.const 0x1.fa50630eec7f5p+166))
(assert_return (invoke "f64.no_fold_recip_recip" (f64.const 0x1.db0598617ba92p-686)) (f64.const 0x1.db0598617ba91p-686))
(assert_return (invoke "f64.no_fold_recip_recip" (f64.const 0x1.85f1638a0c82bp+902)) (f64.const 0x1.85f1638a0c82ap+902))

(assert_return (invoke "f64.no_fold_recip_recip" (f64.const -0x0p+0)) (f64.const -0x0p+0))
(assert_return (invoke "f64.no_fold_recip_recip" (f64.const 0x0p+0)) (f64.const 0x0p+0))
(assert_return (invoke "f64.no_fold_recip_recip" (f64.const -inf)) (f64.const -inf))
(assert_return (invoke "f64.no_fold_recip_recip" (f64.const inf)) (f64.const inf))


