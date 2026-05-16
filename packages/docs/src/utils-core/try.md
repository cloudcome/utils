---
outline: deep
---

# try

安全调用工具，提供 try-catch 包装函数。

## 导入

```typescript
import { tryFlatten, type FlattenAble, type FlattenReturn } from '@cloudcome/utils-core/try'
```

## 类型定义

### FlattenReturn\<T\>

```typescript
type FlattenReturn<T = void> = readonly [Error, undefined] | readonly [undefined, T]
```

**说明**

- 成功时：`[undefined, data]`
- 失败时：`[error, undefined]`

### FlattenAble\<T\>

```typescript
type FlattenAble<T> = SyncFunction<T> | AsyncFunction<T> | CallbackFunction0<T> | PromiseLike<T>
```

## 函数

### tryFlatten

安全执行函数，返回统一的结果格式。

```typescript
// 同步函数
function tryFlatten<T>(flattenAble: SyncFunction<T>): FlattenReturn<T>

// 异步函数
function tryFlatten<T>(flattenAble: AsyncFunction<T>): Promise<FlattenReturn<T>>

// Promise
function tryFlatten<T>(flattenAble: PromiseLike<T>): Promise<FlattenReturn<T>>

// 回调函数
function tryFlatten<T>(flattenAble: CallbackFunction0<T>): Promise<FlattenReturn<T>>
```

**参数**

| 参数        | 类型             | 描述                   |
| ----------- | ---------------- | ---------------------- |
| flattenAble | `FlattenAble<T>` | 要执行的函数或 Promise |

**返回值**

`FlattenReturn<T>` 或 `Promise<FlattenReturn<T>>` - `[error, data]` 元组

**示例**

```typescript
// 同步函数
const [err1, data1] = tryFlatten(() => {
  return JSON.parse('{"key": "value"}')
})
console.log(data1) // { key: 'value' }

// 同步函数抛出错误
const [err2, data2] = tryFlatten(() => {
  return JSON.parse('invalid json')
})
console.log(err2) // SyntaxError

// 异步函数
const [err3, data3] = await tryFlatten(async () => {
  const response = await fetch('/api/data')
  return response.json()
})

// Promise
const [err4, data4] = await tryFlatten(Promise.resolve(42))
console.log(data4) // 42
```
