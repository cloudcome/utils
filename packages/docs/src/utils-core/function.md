---
outline: deep
---

# function

函数工具。

## 导入

```typescript
import { debounce, throttle, curry } from '@cloudcome/utils-core/function'
```

## 函数

### debounce

防抖函数。

```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| fn | `T` | 要防抖的函数 |
| delay | `number` | 延迟时间（毫秒） |

**返回值**

`(...args: Parameters<T>) => void` - 防抖后的函数

**示例**

```typescript
const debouncedFn = debounce((text: string) => {
  console.log(text)
}, 300)

debouncedFn('hello') // 不会立即执行
debouncedFn('world') // 300ms 后只执行一次，输出 'world'
```

### throttle

节流函数。

```typescript
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| fn | `T` | 要节流的函数 |
| delay | `number` | 间隔时间（毫秒） |

**返回值**

`(...args: Parameters<T>) => void` - 节流后的函数

**示例**

```typescript
const throttledFn = throttle((text: string) => {
  console.log(text)
}, 300)

throttledFn('hello') // 立即执行
throttledFn('world') // 300ms 内不会执行
```

### curry

柯里化函数。

```typescript
function curry<T extends (...args: any[]) => any>(
  fn: T
): Curry<Parameters<T>, ReturnType<T>>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| fn | `T` | 要柯里化的函数 |

**返回值**

`Curry<Parameters<T>, ReturnType<T>>` - 柯里化后的函数

**示例**

```typescript
const add = (a: number, b: number, c: number) => a + b + c
const curriedAdd = curry(add)

curriedAdd(1)(2)(3) // 6
curriedAdd(1, 2)(3) // 6
curriedAdd(1)(2, 3) // 6
curriedAdd(1, 2, 3) // 6
```
