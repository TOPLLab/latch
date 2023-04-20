(module
  (type (func (result i32)))
  (table 32 64 funcref)
  (elem (i32.const 24)
         $f0 $f1 $f2 $f3 $f4 $f5 $f6 $f7)
  (func $f0 (export "f0") (result i32) (i32.const 0))
  (func $f1 (export "f1") (result i32) (i32.const 1))
  (func $f2 (export "f2") (result i32) (i32.const 2))
  (func $f3 (export "f3") (result i32) (i32.const 3))
  (func $f4 (export "f4") (result i32) (i32.const 4))
  (func $f5 (export "f5") (result i32) (i32.const 5))
  (func $f6 (export "f6") (result i32) (i32.const 6))
  (func $f7 (export "f7") (result i32) (i32.const 7))
  (func $f8 (export "f8") (result i32) (i32.const 8))
  (func $f9 (export "f9") (result i32) (i32.const 9))
  (func $f10 (export "f10") (result i32) (i32.const 10))
  (func $f11 (export "f11") (result i32) (i32.const 11))
  (func $f12 (export "f12") (result i32) (i32.const 12))
  (func $f13 (export "f13") (result i32) (i32.const 13))
  (func $f14 (export "f14") (result i32) (i32.const 14))
  (func $f15 (export "f15") (result i32) (i32.const 15))
  (func (export "test") (param $n i32) (result i32)
    (call_indirect (type 0) (local.get $n)))
  (func (export "run") (param $targetOffs i32) (param $srcOffs i32) (param $len i32)
    (table.copy (local.get $targetOffs) (local.get $srcOffs) (local.get $len))))

