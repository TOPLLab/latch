(module
  (type $out-i32 (func (result i32)))
  (import "spectest" "table" (table 10 funcref))
  (elem (i32.const 9) $const-i32-a)
  (elem (i32.const 9) $const-i32-b)
  (func $const-i32-a (type $out-i32) (i32.const 65))
  (func $const-i32-b (type $out-i32) (i32.const 66))
  (func (export "call-overwritten-element") (type $out-i32)
    (call_indirect (type $out-i32) (i32.const 9))
  )
)
