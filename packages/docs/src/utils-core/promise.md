---
outline: deep
---

# promise

Promise 工具函数。

## 导入

```typescript
import { 
  isPromiseLike, 
  promiseDelay, 
  promiseTimeout, 
  promiseWhen, 
  promiseShared, 
  createMinDelayPromise 
} from '@cloudcome/utils-core/promise'
```

## 函数

### isPromiseLike

判断是否为类 Promise 对象。

```typescript
function isPromiseLike<T>(unknown: unknown): unknown is Promise<T>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| unknown | `unknown` | 要检查的值 |

**返回值**

`unknown is Promise<T>` - 是否为类 Promise 对象

**示例**

```typescript
isPromiseLike(Promise.resolve()) // true
isPromiseLike({ then: () => {} }) // true
isPromiseLike({}) // false
isPromiseLike(null) // false
```

### promiseDelay

延迟执行。

```typescript
function promiseDelay(ms?: number, ctrl?: AbortController): Promise<void>
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| ms | `number` | `0` | 延迟时间（毫秒） |
| ctrl | `AbortController` | - | 可选，用于取消延迟 |

**返回值**

`Promise<void>`

**示例**

```typescript
// 基本用法
await promiseDelay(1000) // 延迟 1 秒

// 使用 AbortController 取消
const ctrl = new AbortController()
setTimeout(() => ctrl.abort(), 500) // 500ms 后取消
await promiseDelay(1000, ctrl) // 不会等待 1 秒
```

### promiseTimeout

为 Promise 添加超时。

```typescript
function promiseTimeout<T>(promise: Promise<T>, ms: number): Promise<T>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| promise | `Promise<T>` | 原始 Promise |
| ms | `number` | 超时时间（毫秒） |

**返回值**

`Promise<T>` - 带超时的 Promise

**示例**

```typescript
// 基本用法
const data = await promiseTimeout(fetch('/api/data'), 5000) // 5 秒超时

// 超时会抛出错误
try {
  await promiseTimeout(promiseDelay(10000), 1000) // 1 秒超时
} catch (error) {
  console.error('Timeout!') // 会执行这里
}
```

### promiseWhen

等待条件满足。

```typescript
function promiseWhen(condition: () => boolean, ms?: number): Promise<void>
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| condition | `() => boolean` | - | 条件函数 |
| ms | `number` | `0` | 检查间隔（毫秒） |

**返回值**

`Promise<void>`

**示例**

```typescript
let count = 0
const interval = setInterval(() => {
  count++
}, 100)

// 等待 count >= 5
await promiseWhen(() => count >= 5, 50)
console.log(count) // >= 5

clearInterval(interval)
```

### promiseShared

共享 Promise，避免重复请求。

```typescript
function promiseShared<T>(promise: Promise<T>): Promise<T>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| promise | `Promise<T>` | 原始 Promise |

**返回值**

`Promise<T>` - 共享的 Promise

**示例**

```typescript
let callCount = 0
const fetchData = () => {
  callCount++
  return promiseDelay(100).then(() => 'data')
}

// 多次调用共享的 Promise
const shared = promiseShared(fetchData())
const [result1, result2] = await Promise.all([shared, shared])

console.log(result1) // 'data'
console.log(result2) // 'data'
console.log(callCount) // 1，只调用了一次
```

### createMinDelayPromise

创建最小延迟函数。

```typescript
function createMinDelayPromise(ms: number): () => Promise<void>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| ms | `number` | 最小延迟时间（毫秒） |

**返回值**

`() => Promise<void>` - 延迟函数

**示例**

```typescript
const minDelay = createMinDelayPromise(500)

// 使用最小延迟
const start = Date.now()
await minDelay()
const elapsed = Date.now() - start
console.log(elapsed >= 500) // true

// 配合异步操作使用
const minDelay2 = createMinDelayPromise(1000)
async function loadData() {
  const delay = minDelay2()
  const data = await fetch('/api/data')
  await delay // 确保至少等待 1 秒
  return data
}
```
