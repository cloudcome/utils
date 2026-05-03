---
outline: deep
---

# try

安全调用工具，提供 try-catch 包装函数。

## 导入

```typescript
import {
  tryFlatten,
  trySync,
  tryAsync,
  tryCallback,
  tryPromise,
  callbackCurry,
  type FlattenReturn,
  type FlattenAble,
  type SyncFunction,
  type AsyncFunction,
  type Callback,
  type CallbackFunction0,
  type CallbackFunction1,
  type CallbackFunction2,
  type CallbackFunction3,
  type CallbackFunction4,
  type CallbackFunction5,
  type CallbackFunction6,
  type CallbackCurried,
} from '@cloudcome/utils-core/try'
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

### SyncFunction\<T\>

同步函数类型。

```typescript
type SyncFunction<T> = () => T
```

### AsyncFunction\<T\>

异步函数类型。

```typescript
type AsyncFunction<T> = () => Promise<T>
```

### Callback\<T\>

回调函数类型。

```typescript
type Callback<T = void> = (err: null | undefined | void | Error, res: T) => unknown
```

### CallbackFunction0\<T\>

无参数回调函数类型。

```typescript
type CallbackFunction0<T = void> = (callback: Callback<T>) => unknown
```

### CallbackFunction1\<A, T\>

单参数回调函数类型。

```typescript
type CallbackFunction1<A, T = void> = (a: A, callback: Callback<T>) => unknown
```

### CallbackFunction2\<A, B, T\>

双参数回调函数类型。

```typescript
type CallbackFunction2<A, B, T = void> = (a: A, b: B, callback: Callback<T>) => unknown
```

### CallbackFunction3\<A, B, C, T\>

三参数回调函数类型。

```typescript
type CallbackFunction3<A, B, C, T = void> = (a: A, b: B, c: C, callback: Callback<T>) => unknown
```

### CallbackFunction4\<A, B, C, D, T\>

四参数回调函数类型。

```typescript
type CallbackFunction4<A, B, C, D, T = void> = (a: A, b: B, c: C, d: D, callback: Callback<T>) => unknown
```

### CallbackFunction5\<A, B, C, D, E, T\>

五参数回调函数类型。

```typescript
type CallbackFunction5<A, B, C, D, E, T = void> = (
  a: A, b: B, c: C, d: D, e: E,
  callback: Callback<T>
) => unknown
```

### CallbackFunction6\<A, B, C, D, E, F, T\>

六参数回调函数类型。

```typescript
type CallbackFunction6<A, B, C, D, E, F, T = void> = (
  a: A, b: B, c: C, d: D, e: E, f: F,
  callback: Callback<T>
) => unknown
```

### CallbackCurried\<T\>

柯里化后的回调函数类型。

```typescript
type CallbackCurried<T> = (callback: Callback<T>) => unknown
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

| 参数 | 类型 | 描述 |
| --- | --- | --- |
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

### trySync

安全执行同步函数。

```typescript
function trySync<T>(syncFn: SyncFunction<T>): FlattenReturn<T>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| syncFn | `SyncFunction<T>` | 同步函数 |

**返回值**

`FlattenReturn<T>` - `[error, data]` 元组

**示例**

```typescript
const [err, data] = trySync(() => {
  return JSON.parse('{"key": "value"}')
})
console.log(data) // { key: 'value' }
```

### tryAsync

安全执行异步函数。

```typescript
function tryAsync<T>(asyncFn: AsyncFunction<T>): Promise<FlattenReturn<T>>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| asyncFn | `AsyncFunction<T>` | 异步函数 |

**返回值**

`Promise<FlattenReturn<T>>` - `[error, data]` 元组

**示例**

```typescript
const [err, data] = await tryAsync(async () => {
  const response = await fetch('/api/data')
  return response.json()
})
```

### tryCallback

安全执行回调函数。

```typescript
function tryCallback<T>(cf: CallbackFunction0<T>): Promise<FlattenReturn<T>>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| cf | `CallbackFunction0<T>` | 回调函数 |

**返回值**

`Promise<FlattenReturn<T>>` - `[error, data]` 元组

**示例**

```typescript
const [err, data] = await tryCallback((callback) => {
  fs.readFile('/path/to/file', 'utf-8', callback)
})
```

### tryPromise

安全执行 Promise。

```typescript
function tryPromise<T>(promise: PromiseLike<T>): Promise<FlattenReturn<T>>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| promise | `PromiseLike<T>` | Promise 对象 |

**返回值**

`Promise<FlattenReturn<T>>` - `[error, data]` 元组

**示例**

```typescript
const [err, data] = await tryPromise(fetch('/api/data'))
```

### callbackCurry

将回调函数柯里化，返回一个只接受回调的函数。

```typescript
function callbackCurry<T = void>(cf: CallbackFunction0<T>): CallbackCurried<T>
function callbackCurry<A, T = void>(cf: CallbackFunction1<A, T>, a: A): CallbackCurried<T>
function callbackCurry<A, B, T = void>(cf: CallbackFunction2<A, B, T>, a: A, b: B): CallbackCurried<T>
function callbackCurry<A, B, C, T = void>(
  cf: CallbackFunction3<A, B, C, T>, a: A, b: B, c: C
): CallbackCurried<T>
function callbackCurry<A, B, C, D, T = void>(
  cf: CallbackFunction4<A, B, C, D, T>, a: A, b: B, c: C, d: D
): CallbackCurried<T>
function callbackCurry<A, B, C, D, E, T = void>(
  cf: CallbackFunction5<A, B, C, D, E, T>, a: A, b: B, c: C, d: D, e: E
): CallbackCurried<T>
function callbackCurry<A, B, C, D, E, F, T = void>(
  cf: CallbackFunction6<A, B, C, D, E, F, T>, a: A, b: B, c: C, d: D, e: E, f: F
): CallbackCurried<T>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| cf | `CallbackFunction*` | 回调风格的函数 |
| ...args | 对应参数 | 传递给回调函数的参数 |

**返回值**

`CallbackCurried<T>` - 柯里化后的函数，只接受一个回调参数

**示例**

```typescript
import { callbackCurry, tryFlatten } from '@cloudcome/utils-core/try'

// 将 fs.readFile 柯里化
const readFile = callbackCurry(fs.readFile, '/path/to/file', 'utf-8')

// 配合 tryFlatten 使用
const [err, data] = await tryFlatten(readFile)
```
