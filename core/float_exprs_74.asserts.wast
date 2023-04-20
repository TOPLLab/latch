(assert_return (invoke "f32.no_fold_mul_sqrt_div" (f32.const -0x1.f4a7cap+81) (f32.const 0x1.c09adep+92)) (f32.const -inf))
(assert_return (invoke "f32.no_fold_mul_sqrt_div" (f32.const -0x1.90bf1cp-120) (f32.const 0x1.8dbe88p-97)) (f32.const -0x0p+0))
(assert_return (invoke "f32.no_fold_mul_sqrt_div" (f32.const 0x1.8570e8p+29) (f32.const 0x1.217d3p-128)) (f32.const 0x1.6e391ap+93))
(assert_return (invoke "f32.no_fold_mul_sqrt_div" (f32.const -0x1.5b4652p+43) (f32.const 0x1.a9d71cp+112)) (f32.const -0x1.0d423ap-13))
(assert_return (invoke "f32.no_fold_mul_sqrt_div" (f32.const -0x1.910604p+8) (f32.const 0x1.0ca912p+7)) (f32.const -0x1.14cdecp+5))

(assert_return (invoke "f64.no_fold_mul_sqrt_div" (f64.const 0x1.1dcdeb857305fp+698) (f64.const 0x1.a066171c40eb9p+758)) (f64.const inf))
(assert_return (invoke "f64.no_fold_mul_sqrt_div" (f64.const -0x1.8b4f1c218e2abp-827) (f64.const 0x1.5e1ee65953b0bp-669)) (f64.const -0x0p+0))
(assert_return (invoke "f64.no_fold_mul_sqrt_div" (f64.const 0x1.74ee531ddba38p-425) (f64.const 0x1.f370f758857f3p+560)) (f64.const 0x1.0aff34269583ep-705))
(assert_return (invoke "f64.no_fold_mul_sqrt_div" (f64.const -0x1.27f216b0da6c5p+352) (f64.const 0x1.8e0b4e0b9fd7ep-483)) (f64.const -0x1.4fa558aad514ep+593))
(assert_return (invoke "f64.no_fold_mul_sqrt_div" (f64.const 0x1.4c6955df9912bp+104) (f64.const 0x1.0cca42c9d371ep+842)) (f64.const 0x1.4468072f54294p-317))


