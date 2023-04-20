(assert_return (invoke "f32.no_fold_sub_add" (f32.const -0x1.523cb8p+9) (f32.const 0x1.93096cp+8)) (f32.const -0x1.523cbap+9))
(assert_return (invoke "f32.no_fold_sub_add" (f32.const -0x1.a31a1p-111) (f32.const 0x1.745efp-95)) (f32.const -0x1.a4p-111))
(assert_return (invoke "f32.no_fold_sub_add" (f32.const 0x1.3d5328p+26) (f32.const 0x1.58567p+35)) (f32.const 0x1.3d54p+26))
(assert_return (invoke "f32.no_fold_sub_add" (f32.const 0x1.374e26p-39) (f32.const -0x1.66a5p-27)) (f32.const 0x1.374p-39))
(assert_return (invoke "f32.no_fold_sub_add" (f32.const 0x1.320facp-3) (f32.const -0x1.ac069ap+14)) (f32.const 0x1.34p-3))

(assert_return (invoke "f64.no_fold_sub_add" (f64.const 0x1.8f92aad2c9b8dp+255) (f64.const -0x1.08cd4992266cbp+259)) (f64.const 0x1.8f92aad2c9b9p+255))
(assert_return (invoke "f64.no_fold_sub_add" (f64.const 0x1.5aaff55742c8bp-666) (f64.const 0x1.8f5f47181f46dp-647)) (f64.const 0x1.5aaff5578p-666))
(assert_return (invoke "f64.no_fold_sub_add" (f64.const 0x1.21bc52967a98dp+251) (f64.const -0x1.fcffaa32d0884p+300)) (f64.const 0x1.2p+251))
(assert_return (invoke "f64.no_fold_sub_add" (f64.const 0x1.9c78361f47374p-26) (f64.const -0x1.69d69f4edc61cp-13)) (f64.const 0x1.9c78361f48p-26))
(assert_return (invoke "f64.no_fold_sub_add" (f64.const 0x1.4dbe68e4afab2p-367) (f64.const -0x1.dc24e5b39cd02p-361)) (f64.const 0x1.4dbe68e4afacp-367))


