(assert_return (invoke "f32.no_fold_sqrt_square" (f32.const -0x1.5cb316p-66)) (f32.const 0x1.5cb322p-66))
(assert_return (invoke "f32.no_fold_sqrt_square" (f32.const -0x1.b0f9e4p-73)) (f32.const 0x1.b211b2p-73))
(assert_return (invoke "f32.no_fold_sqrt_square" (f32.const -0x1.de417cp-71)) (f32.const 0x1.de65b8p-71))
(assert_return (invoke "f32.no_fold_sqrt_square" (f32.const 0x1.64c872p-86)) (f32.const 0x0p+0))
(assert_return (invoke "f32.no_fold_sqrt_square" (f32.const 0x1.e199e4p+108)) (f32.const inf))

(assert_return (invoke "f64.no_fold_sqrt_square" (f64.const 0x1.1759d657203fdp-529)) (f64.const 0x1.1759dd57545f3p-529))
(assert_return (invoke "f64.no_fold_sqrt_square" (f64.const -0x1.4c68de1c78d83p-514)) (f64.const 0x1.4c68de1c78d81p-514))
(assert_return (invoke "f64.no_fold_sqrt_square" (f64.const -0x1.214736edb6e1ep-521)) (f64.const 0x1.214736ed9cf8dp-521))
(assert_return (invoke "f64.no_fold_sqrt_square" (f64.const -0x1.0864b9f68457p-616)) (f64.const 0x0p+0))
(assert_return (invoke "f64.no_fold_sqrt_square" (f64.const 0x1.b2a9855995abap+856)) (f64.const inf))


