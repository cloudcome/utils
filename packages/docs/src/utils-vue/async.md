---
outline: deep
---

# async

异步组合式函数。

## 导入

```typescript
import { useAsync } from '@cloudcome/utils-vue/async'
```

## 类型定义

### UseAsyncOptions\<I, O\>

```typescript
interface UseAsyncOptions<I extends AnyArray, O> {
  placeholder?: () => O
  onBefore?: (...inputs: I) => unknown
  onSuccess?: (data: O, ...inputs: I) => unknown
  onError?: (err: unknown, ...inputs: I) => unknown
  onAfter?: (...inputs: I) => unknown
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| placeholder | `() => O` | 初始数据占位符 |
| onBefore | `(...inputs: I) => unknown` | 请求前回调 |
| onSuccess | `(data: O, ...inputs: I) => unknown` | 成功回调 |
| onError | `(err: unknown, ...inputs: I) => unknown` | 失败回调 |
| onAfter | `(...inputs: I) => unknown` | 请求后回调（无论成功失败） |

### UseAsyncState\<O\>

```typescript
interface UseAsyncState<O> {
  times: number
  loading: boolean
  error: unknown
  data: O | null
}
```

### UseAsyncStateFilled\<O\>

```typescript
interface UseAsyncStateFilled<O> {
  times: number
  loading: boolean
  error: unknown
  data: O
}
```

### UseAsyncOutput\<I, O\>

```typescript
interface UseAsyncOutput<I extends AnyArray, O> {
  state: ComputedRef<UseAsyncState<O>>
  loading: Ref<boolean>
  data: Ref<O | null>
  error: Ref<unknown>
  run: (...inputs: I) => void
  runAsync: (...inputs: I) => Promise<O>
}
```

### UseAsyncOutputFilled\<I, O\>

```typescript
interface UseAsyncOutputFilled<I extends AnyArray, O> {
  state: ComputedRef<UseAsyncStateFilled<O>>
  loading: Ref<boolean>
  data: Ref<O>
  error: Ref<unknown>
  run: (...inputs: I) => void
  runAsync: (...inputs: I) => Promise<O>
}
```

## 函数

### useAsync

创建异步操作的组合式函数。

```typescript
// 重载 1：带 placeholder
function useAsync<I extends AnyArray, O>(
  fn: (...inputs: I) => Promise<O>,
  options: Omit<UseAsyncOptions<I, O>, 'placeholder'> & { placeholder: () => O }
): UseAsyncOutputFilled<I, O>

// 重载 2：不带 placeholder
function useAsync<I extends AnyArray, O>(
  fn: (...inputs: I) => Promise<O>,
  options?: UseAsyncOptions<I, O>
): UseAsyncOutput<I, O>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| fn | `(...inputs: I) => Promise<O>` | 异步函数 |
| options | `UseAsyncOptions<I, O>` | 可选配置 |

**返回值**

`UseAsyncOutput<I, O>` - 包含状态和方法的对象

**示例**

```typescript
// 基本用法
const { data, loading, error, run } = useAsync(async (id: string) => {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
})

// 执行异步操作
run('123')

// 使用 placeholder
const { data } = useAsync(
  async (id: string) => {
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  },
  {
    placeholder: () => ({ name: '', age: 0 })
  }
)
// data 类型为 Ref<User>，不会为 null

// 使用回调
const { data, loading } = useAsync(
  async (id: string) => {
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  },
  {
    onBefore: (id) => {
      console.log('开始请求:', id)
    },
    onSuccess: (data, id) => {
      console.log('请求成功:', id, data)
    },
    onError: (error, id) => {
      console.error('请求失败:', id, error)
    },
    onAfter: (id) => {
      console.log('请求完成:', id)
    }
  }
)

// 使用 runAsync（返回 Promise）
const { runAsync } = useAsync(async (id: string) => {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
})

try {
  const user = await runAsync('123')
  console.log(user)
} catch (error) {
  console.error(error)
}
```
