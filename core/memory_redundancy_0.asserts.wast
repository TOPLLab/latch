(assert_return (invoke "test_store_to_load") (i32.const 0x00000080))
(assert_return (invoke "test_redundant_load") (i32.const 0x00000080))
(assert_return (invoke "test_dead_store") (f32.const 0x1.18p-144))
(assert_return (invoke "malloc_aliasing") (i32.const 43))
