(assert_return (invoke "f32.no_approximate_reciprocal" (f32.const -0x1.2900b6p-10)) (f32.const -0x1.b950d4p+9))
(assert_return (invoke "f32.no_approximate_reciprocal" (f32.const 0x1.e7212p+127)) (f32.const 0x1.0d11f8p-128))
(assert_return (invoke "f32.no_approximate_reciprocal" (f32.const -0x1.42a466p-93)) (f32.const -0x1.963ee6p+92))
(assert_return (invoke "f32.no_approximate_reciprocal" (f32.const 0x1.5d0c32p+76)) (f32.const 0x1.778362p-77))
(assert_return (invoke "f32.no_approximate_reciprocal" (f32.const -0x1.601de2p-82)) (f32.const -0x1.743d7ep+81))


