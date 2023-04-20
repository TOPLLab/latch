(assert_trap
  (module
    (table 0 funcref)
    (func $f)
    (elem (i32.const 0) $f)
  )
  "out of bounds table access"
)

(assert_trap
  (module
    (table 0 0 funcref)
    (func $f)
    (elem (i32.const 0) $f)
  )
  "out of bounds table access"
)

(assert_trap
  (module
    (table 0 1 funcref)
    (func $f)
    (elem (i32.const 0) $f)
  )
  "out of bounds table access"
)

(assert_trap
  (module
    (table 0 funcref)
    (elem (i32.const 1))
  )
  "out of bounds table access"
)
(assert_trap
  (module
    (table 10 funcref)
    (func $f)
    (elem (i32.const 10) $f)
  )
  "out of bounds table access"
)
(assert_trap
  (module
    (import "spectest" "table" (table 10 funcref))
    (func $f)
    (elem (i32.const 10) $f)
  )
  "out of bounds table access"
)

(assert_trap
  (module
    (table 10 20 funcref)
    (func $f)
    (elem (i32.const 10) $f)
  )
  "out of bounds table access"
)
(assert_trap
  (module
    (import "spectest" "table" (table 10 funcref))
    (func $f)
    (elem (i32.const 10) $f)
  )
  "out of bounds table access"
)

(assert_trap
  (module
    (table 10 funcref)
    (func $f)
    (elem (i32.const -1) $f)
  )
  "out of bounds table access"
)
(assert_trap
  (module
    (import "spectest" "table" (table 10 funcref))
    (func $f)
    (elem (i32.const -1) $f)
  )
  "out of bounds table access"
)

(assert_trap
  (module
    (table 10 funcref)
    (func $f)
    (elem (i32.const -10) $f)
  )
  "out of bounds table access"
)
(assert_trap
  (module
    (import "spectest" "table" (table 10 funcref))
    (func $f)
    (elem (i32.const -10) $f)
  )
  "out of bounds table access"
)


