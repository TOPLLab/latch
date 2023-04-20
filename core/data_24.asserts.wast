(assert_trap
  (module
    (memory 0)
    (data (i32.const 0) "a")
  )
  "out of bounds memory access"
)

(assert_trap
  (module
    (memory 0 0)
    (data (i32.const 0) "a")
  )
  "out of bounds memory access"
)

(assert_trap
  (module
    (memory 0 1)
    (data (i32.const 0) "a")
  )
  "out of bounds memory access"
)
(assert_trap
  (module
    (memory 0)
    (data (i32.const 1))
  )
  "out of bounds memory access"
)
(assert_trap
  (module
    (memory 0 1)
    (data (i32.const 1))
  )
  "out of bounds memory access"
)

(;assert_unlinkable
  (module
    (memory 0x10000)
    (data (i32.const 0xffffffff) "ab")
  )
  ""  ;; either out of memory or out of bounds
;)

(assert_trap
  (module
    (global (import "spectest" "global_i32") i32)
    (memory 0)
    (data (global.get 0) "a")
  )
  "out of bounds memory access"
)

(assert_trap
  (module
    (memory 1 2)
    (data (i32.const 0x1_0000) "a")
  )
  "out of bounds memory access"
)
(assert_trap
  (module
    (import "spectest" "memory" (memory 1))
    (data (i32.const 0x1_0000) "a")
  )
  "out of bounds memory access"
)

(assert_trap
  (module
    (memory 2)
    (data (i32.const 0x2_0000) "a")
  )
  "out of bounds memory access"
)

(assert_trap
  (module
    (memory 2 3)
    (data (i32.const 0x2_0000) "a")
  )
  "out of bounds memory access"
)

(assert_trap
  (module
    (memory 1)
    (data (i32.const -1) "a")
  )
  "out of bounds memory access"
)
(assert_trap
  (module
    (import "spectest" "memory" (memory 1))
    (data (i32.const -1) "a")
  )
  "out of bounds memory access"
)

(assert_trap
  (module
    (memory 2)
    (data (i32.const -100) "a")
  )
  "out of bounds memory access"
)
(assert_trap
  (module
    (import "spectest" "memory" (memory 1))
    (data (i32.const -100) "a")
  )
  "out of bounds memory access"
)


