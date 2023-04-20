(assert_return (invoke "f32.no_fold_to_hypot" (f32.const 0x1.c2f338p-81) (f32.const 0x1.401b5ep-68)) (f32.const 0x1.401cccp-68))
(assert_return (invoke "f32.no_fold_to_hypot" (f32.const -0x1.c38d1p-71) (f32.const -0x1.359ddp-107)) (f32.const 0x1.c36a62p-71))
(assert_return (invoke "f32.no_fold_to_hypot" (f32.const -0x1.99e0cap-114) (f32.const -0x1.ed0c6cp-69)) (f32.const 0x1.ed0e48p-69))
(assert_return (invoke "f32.no_fold_to_hypot" (f32.const -0x1.1b6ceap+5) (f32.const 0x1.5440bep+17)) (f32.const 0x1.5440cp+17))
(assert_return (invoke "f32.no_fold_to_hypot" (f32.const 0x1.8f019ep-76) (f32.const -0x1.182308p-71)) (f32.const 0x1.17e2bcp-71))
(assert_return (invoke "f64.no_fold_to_hypot" (f64.const 0x1.1a0ac4f7c8711p-636) (f64.const 0x1.1372ebafff551p-534)) (f64.const 0x1.13463fa37014ep-534))
(assert_return (invoke "f64.no_fold_to_hypot" (f64.const 0x1.b793512167499p+395) (f64.const -0x1.11cbc52af4c36p+410)) (f64.const 0x1.11cbc530783a2p+410))
(assert_return (invoke "f64.no_fold_to_hypot" (f64.const 0x1.76777f44ff40bp-536) (f64.const -0x1.c3896e4dc1fbp-766)) (f64.const 0x1.8p-536))
(assert_return (invoke "f64.no_fold_to_hypot" (f64.const -0x1.889ac72cc6b5dp-521) (f64.const 0x1.8d7084e659f3bp-733)) (f64.const 0x1.889ac72ca843ap-521))
(assert_return (invoke "f64.no_fold_to_hypot" (f64.const 0x1.5ee588c02cb08p-670) (f64.const -0x1.05ce25788d9ecp-514)) (f64.const 0x1.05ce25788d9dfp-514))


