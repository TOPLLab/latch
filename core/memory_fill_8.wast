(module
  (memory 1 1 )
  
  (func (export "checkRange") (param $from i32) (param $to i32) (param $expected i32) (result i32)
    (loop $cont
      (if (i32.eq (local.get $from) (local.get $to))
        (then
          (return (i32.const -1))))
      (if (i32.eq (i32.load8_u (local.get $from)) (local.get $expected))
        (then
          (local.set $from (i32.add (local.get $from) (i32.const 1)))
          (br $cont))))
    (return (local.get $from)))

  (func (export "run") (param $offs i32) (param $val i32) (param $len i32)
    (memory.fill (local.get $offs) (local.get $val) (local.get $len))))

