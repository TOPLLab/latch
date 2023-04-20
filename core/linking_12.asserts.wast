(assert_return (get $G2 "g") (i32.const 5))

(assert_trap
  (module
    (table (import "Mt" "tab") 0 funcref)
    (elem (i32.const 10) $f)
    (func $f)
  )
  "out of bounds table access"
)

(assert_trap (invoke $Mt "call" (i32.const 7)) "uninitialized element")

(assert_trap
  (module
    (table (import "Mt" "tab") 10 funcref)
    (func $f (result i32) (i32.const 0))
    (elem (i32.const 7) $f)
    (elem (i32.const 8) $f $f $f $f $f)  ;; (partially) out of bounds
  )
  "out of bounds table access"
)
(assert_return (invoke $Mt "call" (i32.const 7)) (i32.const 0))
(assert_trap (invoke $Mt "call" (i32.const 8)) "uninitialized element")

(assert_trap
  (module
    (table (import "Mt" "tab") 10 funcref)
    (func $f (result i32) (i32.const 0))
    (elem (i32.const 7) $f)
    (memory 1)
    (data (i32.const 0x10000) "d")  ;; out of bounds
  )
  "out of bounds memory access"
)
(assert_return (invoke $Mt "call" (i32.const 7)) (i32.const 0))


