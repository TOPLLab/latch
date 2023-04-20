(assert_return (invoke "f32.no_fold_div_div" (f32.const -0x1.f70228p+78) (f32.const -0x1.fbc612p-16) (f32.const -0x1.8c379p+10)) (f32.const -0x1.47b43cp+83))
(assert_return (invoke "f32.no_fold_div_div" (f32.const 0x1.d29d2ep-70) (f32.const 0x1.f3a17ep+110) (f32.const -0x1.64d41p-112)) (f32.const -0x0p+0))
(assert_return (invoke "f32.no_fold_div_div" (f32.const 0x1.867f98p+43) (f32.const 0x1.30acfcp-105) (f32.const 0x1.e210d8p+105)) (f32.const inf))
(assert_return (invoke "f32.no_fold_div_div" (f32.const -0x1.c4001ap-14) (f32.const -0x1.9beb6cp+124) (f32.const -0x1.74f34cp-43)) (f32.const -0x1.819874p-96))
(assert_return (invoke "f32.no_fold_div_div" (f32.const 0x1.db0e6ep+46) (f32.const 0x1.55eea2p+56) (f32.const -0x1.f3134p+124)) (f32.const -0x1.6cep-135))

(assert_return (invoke "f64.no_fold_div_div" (f64.const 0x1.b4dc8ec3c7777p+337) (f64.const 0x1.9f95ac2d1863p+584) (f64.const -0x1.d4318abba341ep-782)) (f64.const -0x1.2649159d87e02p+534))
(assert_return (invoke "f64.no_fold_div_div" (f64.const -0x1.ac53af5eb445fp+791) (f64.const 0x1.8549c0a4ceb13p-29) (f64.const 0x1.64e384003c801p+316)) (f64.const -0x1.9417cdccbae91p+503))
(assert_return (invoke "f64.no_fold_div_div" (f64.const -0x1.d2685afb27327p+2) (f64.const -0x1.abb1eeed3dbebp+880) (f64.const 0x1.a543e2e6968a3p+170)) (f64.const 0x0.0000002a69a5fp-1022))
(assert_return (invoke "f64.no_fold_div_div" (f64.const -0x1.47ddede78ad1cp+825) (f64.const 0x1.6d932d070a367p-821) (f64.const 0x1.79cf18cc64fp+961)) (f64.const -inf))
(assert_return (invoke "f64.no_fold_div_div" (f64.const -0x1.f73d4979a9379p-888) (f64.const 0x1.4d83b53e97788p-596) (f64.const -0x1.f8f86c9603b5bp-139)) (f64.const 0x1.87a7bd89c586cp-154))


