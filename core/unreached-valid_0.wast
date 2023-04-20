(module

  ;; Check that both sides of the select are evaluated
  (func (export "select-trap-left") (param $cond i32) (result i32)
    (select (unreachable) (i32.const 0) (local.get $cond))
  )
  (func (export "select-trap-right") (param $cond i32) (result i32)
    (select (i32.const 0) (unreachable) (local.get $cond))
  )

  (func (export "select-unreached")
    (unreachable) (select)
    (unreachable) (i32.const 0) (select)
    (unreachable) (i32.const 0) (i32.const 0) (select)
    (unreachable) (i32.const 0) (i32.const 0) (i32.const 0) (select)
    (unreachable) (f32.const 0) (i32.const 0) (select)
    (unreachable)
  )

  (func (export "select_unreached_result_1") (result i32)
    (unreachable) (i32.add (select))
  )

  (func (export "select_unreached_result_2") (result i64)
    (unreachable) (i64.add (select (i64.const 0) (i32.const 0)))
  )

  (func (export "unreachable-num")
    (unreachable)
    (select)
    (i32.eqz)
    (drop)
  )
  (func (export "unreachable-ref")
    (unreachable)
    (select)
    (ref.is_null)
    (drop)
  )
)

