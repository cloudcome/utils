---
outline: deep
---

# state

状态管理工具。

## 导入

```typescript
import { useOnceState } from '@cloudcome/utils-vue/state'
import type { UseOnceValueOptions } from '@cloudcome/utils-vue/state'
```

## 类型定义

### UseOnceValueOptions\<T\>

```typescript
interface UseOnceValueOptions<T> {
  equal?: (a: T, b: T) => boolean
}
```

**属性说明**

| 属性  | 类型                      | 描述               |
| ----- | ------------------------- | ------------------ |
| equal | `(a: T, b: T) => boolean` | 自定义相等比较函数 |

## 函数

### useOnceState

创建只能改变一次的状态。

```typescript
function useOnceState<T>(value: T, options?: UseOnceValueOptions<T>): {
  change: (newValue: T) => void
  state: ComputedRef<T>
}
```

**参数**

| 参数    | 类型                     | 描述     |
| ------- | ------------------------ | -------- |
| value   | `T`                      | 初始值   |
| options | `UseOnceValueOptions<T>` | 可选配置 |

**返回值**

`{ change: (newValue: T) => void; state: ComputedRef<T> }` - 包含 `change` 方法和 `state` 计算属性的对象

**示例**

```typescript
// 基本用法
const { state: count, change: setCount } = useOnceState(0)

console.log(count.value) // 0
setCount(1)
console.log(count.value) // 1
setCount(2) // 无效，只能改变一次
console.log(count.value) // 1

// 值相等时不视为"已改变"，仍允许更改
const { state, change } = useOnceState(10)
change(10) // 传入相同值，不视为改变
change(20) // 有效，因为之前没有成功改变过
console.log(state.value) // 20

// 自定义相等比较
const { state: user, change: setUser } = useOnceState(
  { name: 'Alice', age: 25 },
  {
    equal: (a, b) => a.name === b.name
  }
)

setUser({ name: 'Alice', age: 30 }) // 无效，name 相同
console.log(user.value.name) // 'Alice'

setUser({ name: 'Bob', age: 30 }) // 有效，name 不同
console.log(user.value.name) // 'Bob'

setUser({ name: 'Charlie', age: 40 }) // 无效，已经改变过一次
console.log(user.value.name) // 'Bob'

// 对象引用比较（默认行为）
const obj1 = { x: 1 }
const obj2 = { x: 2 }
const { state, change } = useOnceState(obj1)

change(obj2) // 有效，不同引用
console.log(state.value) // obj2

change(obj2) // 无效，已改变过
console.log(state.value) // 仍为 obj2
```
