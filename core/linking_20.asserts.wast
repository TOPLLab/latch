(assert_trap
  (module
    (import "Ms" "memory" (memory 1))
    (import "Ms" "table" (table 1 funcref))
    (data (i32.const 0) "hello")
    (elem (i32.const 0) $f)
    (func $f (result i32)
      (i32.const 0xdead)
    )
    (func $main
      (unreachable)
    )
    (start $main)
  )
  "unreachable"
)

(assert_return (invoke $Ms "get memory[0]") (i32.const 104))  ;; 'h'
(assert_return (invoke $Ms "get table[0]") (i32.const 0xdead))
