(assert_return (invoke "f32.no_fold_mul_sqrts" (f32.const 0x1.dddda8p-125) (f32.const -0x1.25d22ap-83)) (f32.const nan:canonical))
(assert_return (invoke "f32.no_fold_mul_sqrts" (f32.const 0x1.418d14p-92) (f32.const 0x1.c6535cp-32)) (f32.const 0x1.7e373ap-62))
(assert_return (invoke "f32.no_fold_mul_sqrts" (f32.const 0x1.4de7ep-88) (f32.const 0x1.84ff18p+6)) (f32.const 0x1.686668p-41))
(assert_return (invoke "f32.no_fold_mul_sqrts" (f32.const 0x1.78091ep+101) (f32.const 0x1.81feb8p-9)) (f32.const 0x1.7cfb98p+46))
(assert_return (invoke "f32.no_fold_mul_sqrts" (f32.const 0x1.583ap-56) (f32.const 0x1.14ba2ap-9)) (f32.const 0x1.b47a8ep-33))

(assert_return (invoke "f64.no_fold_mul_sqrts" (f64.const -0x1.d1144cc28cdbep-635) (f64.const -0x1.bf9bc373d3b6ap-8)) (f64.const nan:canonical))
(assert_return (invoke "f64.no_fold_mul_sqrts" (f64.const 0x1.5a7eb976bebc9p-643) (f64.const 0x1.f30cb8865a4cap-404)) (f64.const 0x1.260a1032d6e76p-523))
(assert_return (invoke "f64.no_fold_mul_sqrts" (f64.const 0x1.711a0c1707935p-89) (f64.const 0x1.6fb5de51a20d3p-913)) (f64.const 0x1.7067ca28e31ecp-501))
(assert_return (invoke "f64.no_fold_mul_sqrts" (f64.const 0x1.fb0bbea33b076p-363) (f64.const 0x1.d963b34894158p-573)) (f64.const 0x1.e9edc1fa624afp-468))
(assert_return (invoke "f64.no_fold_mul_sqrts" (f64.const 0x1.8676eab7a4d0dp+24) (f64.const 0x1.75a58231ba7a5p+513)) (f64.const 0x1.0e16aebe203b3p+269))


