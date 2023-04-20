(assert_return (invoke "f32.no_fold_div_sqrts" (f32.const -0x1.bea9bap+25) (f32.const -0x1.db776ep-58)) (f32.const nan:canonical))
(assert_return (invoke "f32.no_fold_div_sqrts" (f32.const 0x1.b983b6p+32) (f32.const 0x1.901f1ep+27)) (f32.const 0x1.7c4df6p+2))
(assert_return (invoke "f32.no_fold_div_sqrts" (f32.const 0x1.d45e72p-120) (f32.const 0x1.ab49ccp+15)) (f32.const 0x1.7b0b04p-68))
(assert_return (invoke "f32.no_fold_div_sqrts" (f32.const 0x1.b2e444p+59) (f32.const 0x1.5b8b16p-30)) (f32.const 0x1.94fca8p+44))
(assert_return (invoke "f32.no_fold_div_sqrts" (f32.const 0x1.835aa6p-112) (f32.const 0x1.d17128p-103)) (f32.const 0x1.4a468p-5))

(assert_return (invoke "f64.no_fold_div_sqrts" (f64.const -0x1.509fc16411167p-711) (f64.const -0x1.9c4255f5d6517p-187)) (f64.const nan:canonical))
(assert_return (invoke "f64.no_fold_div_sqrts" (f64.const 0x1.b6897bddac76p-587) (f64.const 0x1.104578b4c91f3p+541)) (f64.const 0x1.44e4f21f26cc9p-564))
(assert_return (invoke "f64.no_fold_div_sqrts" (f64.const 0x1.ac83451b08989p+523) (f64.const 0x1.8da575c6d12b8p-109)) (f64.const 0x1.09c003991ce17p+316))
(assert_return (invoke "f64.no_fold_div_sqrts" (f64.const 0x1.bab7836456417p-810) (f64.const 0x1.1ff60d03ba607p+291)) (f64.const 0x1.c0e6c833bf657p-551))
(assert_return (invoke "f64.no_fold_div_sqrts" (f64.const 0x1.a957816ad9515p-789) (f64.const 0x1.8c18a3a222ab1p+945)) (f64.const 0x1.0948539781e92p-867))


