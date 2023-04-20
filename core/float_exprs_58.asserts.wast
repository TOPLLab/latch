(assert_return (invoke "f32.no_algebraic_factoring" (f32.const 0x1.8e2c14p-46) (f32.const 0x1.bad59ap-39)) (f32.const -0x1.7efe5p-77))
(assert_return (invoke "f32.no_algebraic_factoring" (f32.const -0x1.7ef192p+41) (f32.const -0x1.db184ap+33)) (f32.const 0x1.1e6932p+83))
(assert_return (invoke "f32.no_algebraic_factoring" (f32.const 0x1.7eb458p-12) (f32.const -0x1.52c498p-13)) (f32.const 0x1.cc0bc6p-24))
(assert_return (invoke "f32.no_algebraic_factoring" (f32.const 0x1.2675c6p-44) (f32.const -0x1.edd31ap-46)) (f32.const 0x1.17294cp-88))
(assert_return (invoke "f32.no_algebraic_factoring" (f32.const 0x1.9a5f92p+51) (f32.const -0x1.2b0098p+52)) (f32.const -0x1.7189a6p+103))

(assert_return (invoke "f64.no_algebraic_factoring" (f64.const 0x1.749a128f18f69p+356) (f64.const -0x1.0bc97ee1354e1p+337)) (f64.const 0x1.0f28115518d74p+713))
(assert_return (invoke "f64.no_algebraic_factoring" (f64.const -0x1.2dab01b2215eap+309) (f64.const -0x1.e12b288bff2bdp+331)) (f64.const -0x1.c4319ad25d201p+663))
(assert_return (invoke "f64.no_algebraic_factoring" (f64.const 0x1.3ed898431e102p+42) (f64.const -0x1.c409183fa92e6p+39)) (f64.const 0x1.80a611103c71dp+84))
(assert_return (invoke "f64.no_algebraic_factoring" (f64.const -0x1.be663e4c0e4b2p+182) (f64.const -0x1.da85703760d25p+166)) (f64.const 0x1.853434f1a2ffep+365))
(assert_return (invoke "f64.no_algebraic_factoring" (f64.const -0x1.230e09952df1cp-236) (f64.const -0x1.fa2752adfadc9p-237)) (f64.const 0x1.42e43156bd1b8p-474))


