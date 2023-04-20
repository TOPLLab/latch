(assert_trap
  (module
    (memory (import "Mm" "mem") 0)
    (data (i32.const 0x10000) "a")
  )
  "out of bounds memory access"
)

