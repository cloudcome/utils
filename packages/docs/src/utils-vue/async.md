---
outline: deep
---

# async

异步组合式函数。

## 导入

```typescript
import { useAsync } from '@cloudcome/utils-vue/async'
import type { UseAsyncOptions, UseAsyncState, UseAsyncOutput } from '@cloudcome/utils-vue/async'
```

## 类型定义

### UseAsyncOptions\<I, O\>

```typescript
interface UseAsyncOptions<I extends AnyArray, O> {
  onBefore?: (...inputs: I) => unknown
  onSuccess?: (data: O, ...inputs: I) => unknown
  onError?: (err: unknown, ...inputs: I) => unknown
  onAfter?: (...inputs: I) => unknown
}
```

**属性说明**

| 属性      | 类型                                      | 描述                                                                   |
| --------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| onBefore  | `(...inputs: I) => unknown`               | 请求前回调，**支持异步**。若抛出错误，将中断后续操作，主函数不会被调用 |
| onSuccess | `(data: O, ...inputs: I) => unknown`      | 成功回调，**支持异步**                                                 |
| onError   | `(err: unknown, ...inputs: I) => unknown` | 失败回调，**支持异步**                                                 |
| onAfter   | `(...inputs: I) => unknown`               | 请求后回调（无论成功失败），**支持异步**                               |

**执行顺序**

所有钩子按 `onBefore → onSuccess/onError → onAfter` 顺序依次执行，每个钩子等待前一个完成后才调用。

### UseAsyncState

```typescript
interface UseAsyncState {
  times: number
  loading: boolean
  error: unknown
}
```

**属性说明**

| 属性    | 类型      | 描述                        |
| ------- | --------- | --------------------------- |
| times   | `number`  | 已执行次数                  |
| loading | `boolean` | 是否正在加载                |
| error   | `unknown` | 错误信息，无错误时为 `null` |

### UseAsyncOutput\<I, O\>

```typescript
interface UseAsyncOutput<I extends AnyArray, O> {
  state: ComputedRef<UseAsyncState>
  loading: ComputedRef<boolean>
  data: ComputedRef<O | null>
  error: ComputedRef<unknown>
  run: (...inputs: I) => void
  runAsync: (...inputs: I) => Promise<O>
}

```

## 函数

### useAsync

创建异步操作的组合式函数。

```typescript
function useAsync<I extends AnyArray, O>(
  fn: (...inputs: I) => Promise<O>,
  options?: UseAsyncOptions<I, O>
): UseAsyncOutput<I, O>
```

**参数**

| 参数    | 类型                           | 描述     |
| ------- | ------------------------------ | -------- |
| fn      | `(...inputs: I) => Promise<O>` | 异步函数 |
| options | `UseAsyncOptions<I, O>`        | 可选配置 |

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

// 异步钩子：所有生命周期钩子都支持异步
const { runAsync } = useAsync(
  async (id: string) => {
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  },
  {
    onBefore: async (id) => {
      // 异步预处理
      await somePrep(id)
    },
    onSuccess: async (data, id) => {
      // 异步后处理
      await saveToCache(data)
    },
    onAfter: async (id) => {
      // 异步清理
      await cleanup(id)
    }
  }
)

// onBefore 抛出错误会中断操作
const { runAsync, error } = useAsync(
  async () => fetchData(),
  {
    onBefore: () => {
      throw new Error('validation failed')
    }
  }
)
// runAsync 会抛出 'validation failed'
// error.value 为该错误
// 主函数不会被调用

// run 方法的返回值
const { run } = useAsync(async (id: string) => ({ name: 'test' }))
const result = run('123')
// run 返回 Promise，可以 await 或 .then
result.then(data => console.log(data)) // { name: 'test' }

// 多次调用更新数据
const { data, runAsync } = useAsync(async (id: number) => fetchItem(id))
await runAsync(1)
console.log(data.value) // item 1
await runAsync(2)
console.log(data.value) // item 2（覆盖前次结果）

// 传递多个参数
const { runAsync } = useAsync(async (name: string, age: number, meta: object) => {
  return { name, age, meta }
})
await runAsync('Alice', 25, { role: 'admin' })
```
