---
outline: deep
---

# function

函数工具，提供防抖、节流、单次执行等函数包装器。

## 导入

```typescript
import {
  fnNoop,
  fnDebounce,
  fnThrottle,
  fnOnce,
  type DebounceOptions,
  type ThrottleOptions,
} from '@cloudcome/utils-core/function'
```

## 类型定义

### DebounceOptions

防抖函数的配置选项。

```typescript
type DebounceOptions = {
  wait: number
  leading?: boolean
}
```

**属性说明**

| 属性    | 类型      | 默认值  | 描述                         |
| ------- | --------- | ------- | ---------------------------- |
| wait    | `number`  | -       | 等待时间（毫秒）             |
| leading | `boolean` | `false` | 是否在等待开始时立即执行一次 |

### ThrottleOptions

节流函数的配置选项。

```typescript
type ThrottleOptions = {
  wait: number
  leading?: boolean
  trailing?: boolean
}
```

**属性说明**

| 属性     | 类型      | 默认值  | 描述                               |
| -------- | --------- | ------- | ---------------------------------- |
| wait     | `number`  | -       | 等待时间（毫秒）                   |
| leading  | `boolean` | `false` | 是否在第一次调用时立即执行         |
| trailing | `boolean` | `false` | 是否在调用结束后等待一段时间再执行 |

## 函数

### fnNoop

空操作函数，不执行任何操作。

```typescript
function fnNoop(): void
```

**示例**

```typescript
fnNoop() // 不执行任何操作

// 常用作默认回调
const callback = optionalCallback || fnNoop
```

### fnDebounce

创建一个防抖函数，在指定的等待时间后执行。如果在等待时间内再次调用，则重新计时。

```typescript
function fnDebounce<F extends AnyFunction>(
  fn: F,
  wait: number | DebounceOptions
): ((...args: Parameters<F>) => void) & { cancel: () => void }
```

**参数**

| 参数 | 类型                        | 描述                           |
| ---- | --------------------------- | ------------------------------ |
| fn   | `F`                         | 需要防抖的函数                 |
| wait | `number \| DebounceOptions` | 等待时间（毫秒）或配置选项对象 |

**返回值**

`((...args: Parameters<F>) => void) & { cancel: () => void }` - 防抖后的函数，签名与原函数参数一致但返回值始终为 `void`，带有 `cancel` 方法用于取消防抖

**示例**

```typescript
const debouncedFn = fnDebounce(() => {
  console.log('执行')
}, 100)

debouncedFn() // 不会立即执行
debouncedFn() // 重新计时
// 100ms 后输出: 执行

debouncedFn.cancel() // 取消防抖

// 使用 leading 选项
const debouncedFn2 = fnDebounce(() => {
  console.log('执行')
}, { wait: 100, leading: true })

debouncedFn2() // 立即输出: 执行
debouncedFn2() // 重新计时
```

### fnThrottle

创建一个节流函数，在指定的等待时间内最多执行一次。

```typescript
function fnThrottle<F extends AnyFunction>(
  fn: F,
  wait: number | ThrottleOptions
): ((...args: Parameters<F>) => void) & { cancel: () => void }
```

**参数**

| 参数 | 类型                        | 描述                           |
| ---- | --------------------------- | ------------------------------ |
| fn   | `F`                         | 需要节流的函数                 |
| wait | `number \| ThrottleOptions` | 等待时间（毫秒）或配置选项对象 |

**返回值**

`((...args: Parameters<F>) => void) & { cancel: () => void }` - 节流后的函数，签名与原函数参数一致但返回值始终为 `void`，带有 `cancel` 方法用于取消节流

**示例**

```typescript
const throttledFn = fnThrottle(() => {
  console.log('执行')
}, 100)

throttledFn() // 开始计时
throttledFn() // 忽略
// 100ms 后输出: 执行

throttledFn.cancel() // 取消节流

// 使用 leading 和 trailing
const throttledFn2 = fnThrottle(() => {
  console.log('执行')
}, { wait: 100, leading: true, trailing: true })

throttledFn2() // 立即输出: 执行
throttledFn2() // 忽略，但会在 100ms 后输出: 执行
```

### fnOnce

创建一个只执行一次的函数，后续调用返回第一次的结果。

```typescript
function fnOnce<F extends AnyFunction>(fn: F): (...args: Parameters<F>) => ReturnType<F>
```

**参数**

| 参数 | 类型 | 描述                 |
| ---- | ---- | -------------------- |
| fn   | `F`  | 需要只执行一次的函数 |

**返回值**

`(...args: Parameters<F>) => ReturnType<F>` - 只执行一次的函数，参数签名与原函数一致，第一次调用后缓存并返回结果

**示例**

```typescript
const onceFn = fnOnce(() => {
  console.log('只会输出一次')
  return 42
})

console.log(onceFn()) // 输出: 只会输出一次  42
console.log(onceFn()) // 输出: 42（不执行函数体）
```
