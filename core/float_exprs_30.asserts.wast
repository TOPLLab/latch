(assert_return (invoke "f32.no_fold_add_sub" (f32.const 0x1.b553e4p-47) (f32.const -0x1.67db2cp-26)) (f32.const 0x1.cp-47))
(assert_return (invoke "f32.no_fold_add_sub" (f32.const -0x1.a884dp-23) (f32.const 0x1.f2ae1ep-19)) (f32.const -0x1.a884ep-23))
(assert_return (invoke "f32.no_fold_add_sub" (f32.const -0x1.fc04fp+82) (f32.const -0x1.65403ap+101)) (f32.const -0x1p+83))
(assert_return (invoke "f32.no_fold_add_sub" (f32.const 0x1.870fa2p-78) (f32.const 0x1.c54916p-56)) (f32.const 0x1.8p-78))
(assert_return (invoke "f32.no_fold_add_sub" (f32.const -0x1.17e966p-108) (f32.const -0x1.5fa61ap-84)) (f32.const -0x1p-107))

(assert_return (invoke "f64.no_fold_add_sub" (f64.const -0x1.1053ea172dba8p-874) (f64.const 0x1.113c413408ac8p-857)) (f64.const -0x1.1053ea172p-874))
(assert_return (invoke "f64.no_fold_add_sub" (f64.const 0x1.e377d54807972p-546) (f64.const 0x1.040a0a4d1ff7p-526)) (f64.const 0x1.e377d548p-546))
(assert_return (invoke "f64.no_fold_add_sub" (f64.const -0x1.75f53cd926b62p-30) (f64.const -0x1.66b176e602bb5p-3)) (f64.const -0x1.75f53dp-30))
(assert_return (invoke "f64.no_fold_add_sub" (f64.const -0x1.c450ff28332ap-341) (f64.const 0x1.15a5855023baep-305)) (f64.const -0x1.c451p-341))
(assert_return (invoke "f64.no_fold_add_sub" (f64.const -0x1.1ad4a596d3ea8p-619) (f64.const -0x1.17d81a41c0ea8p-588)) (f64.const -0x1.1ad4a8p-619))


