(assert_return (get $Mg "glob") (i32.const 42))
(assert_return (get $Ng "Mg.glob") (i32.const 42))
(assert_return (get $Ng "glob") (i32.const 43))
(assert_return (invoke $Mg "get") (i32.const 42))
(assert_return (invoke $Ng "Mg.get") (i32.const 42))
(assert_return (invoke $Ng "get") (i32.const 43))

(assert_return (get $Mg "mut_glob") (i32.const 142))
(assert_return (get $Ng "Mg.mut_glob") (i32.const 142))
(assert_return (invoke $Mg "get_mut") (i32.const 142))
(assert_return (invoke $Ng "Mg.get_mut") (i32.const 142))

(assert_return (invoke $Mg "set_mut" (i32.const 241)))
(assert_return (get $Mg "mut_glob") (i32.const 241))
(assert_return (get $Ng "Mg.mut_glob") (i32.const 241))
(assert_return (invoke $Mg "get_mut") (i32.const 241))
(assert_return (invoke $Ng "Mg.get_mut") (i32.const 241))


