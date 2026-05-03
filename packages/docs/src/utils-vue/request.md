---
outline: deep
---

# request

请求组合式函数，支持缓存、共享、重试等功能。

## 导入

```typescript
import { useRequest } from '@cloudcome/utils-vue/request'
```

## 类型定义

### UseRequestOptions\<I, O\>

```typescript
interface UseRequestOptions<I extends AnyArray, O> extends UseAsyncOptions<I, O> {
  id?: MaybeCallable<string>
  cache?: boolean | RequestCacheOptions<O>
  share?: boolean | RequestShareOptions
  onCacheHit?: (cached: Cached<O>) => unknown
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| id | `MaybeCallable<string>` | 请求 ID，用于缓存和共享 |
| cache | `boolean \| RequestCacheOptions<O>` | 缓存配置 |
| share | `boolean \| RequestShareOptions` | 共享配置 |
| onCacheHit | `(cached: Cached<O>) => unknown` | 缓存命中回调 |

### RequestCacheOptions\<T\>

```typescript
interface RequestCacheOptions<T> extends CacheOptions {
  disabled?: boolean
  storage?: Cache<T>
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| disabled | `boolean` | 是否禁用缓存 |
| storage | `Cache<T>` | 自定义缓存存储 |
| maxAge | `number` | 缓存过期时间（毫秒） |
| expiredAt | `DateValue` | 缓存过期时间点 |

### RequestShareOptions

```typescript
interface RequestShareOptions {
  disabled?: boolean
  maxAge?: number
  expiredAt?: DateValue
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| disabled | `boolean` | 是否禁用共享 |
| maxAge | `number` | 共享过期时间（毫秒） |
| expiredAt | `DateValue` | 共享过期时间点 |

### UseRequestOutput\<I, O\>

```typescript
interface UseRequestOutput<I extends AnyArray, O> {
  state: ComputedRef<UseRequestState<O>>
  loading: Ref<boolean>
  data: Ref<O | null>
  error: Ref<unknown>
  send: (...inputs: I) => void
  sendAsync: (...inputs: I) => Promise<O>
  hitShare: Ref<boolean>
  hitCache: Ref<boolean>
}
```

### UseRequestOutputFilled\<I, O\>

```typescript
interface UseRequestOutputFilled<I extends AnyArray, O> {
  state: ComputedRef<UseRequestStateFilled<O>>
  loading: Ref<boolean>
  data: Ref<O>
  error: Ref<unknown>
  send: (...inputs: I) => void
  sendAsync: (...inputs: I) => Promise<O>
  hitShare: Ref<boolean>
  hitCache: Ref<boolean>
}
```

## 函数

### useRequest

创建请求组合式函数。

```typescript
// 重载 1：带 placeholder，data 不会为 null
function useRequest<I extends AnyArray, O>(
  fn: (...inputs: I) => Promise<O>,
  options: Omit<UseRequestOptions<I, O>, 'placeholder'> & { placeholder: () => O }
): UseRequestOutputFilled<I, O>

// 重载 2：不带 placeholder，data 可能为 null
function useRequest<I extends AnyArray, O>(
  fn: (...inputs: I) => Promise<O>,
  options?: UseRequestOptions<I, O>
): UseRequestOutput<I, O>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| fn | `(...inputs: I) => Promise<O>` | 请求函数 |
| options | `UseRequestOptions<I, O>` | 可选配置 |

**返回值**

`UseRequestOutput<I, O>` 或 `UseRequestOutputFilled<I, O>` - 请求状态和方法

**示例**

```typescript
// 基本用法
const { data, loading, error, send } = useRequest(async (id: string) => {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
})

// 发送请求
send('123')

// 带 placeholder
const { data } = useRequest(
  async (id: string) => {
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  },
  {
    placeholder: () => ({ name: '', age: 0 })
  }
)
// data 类型为 Ref<User>，不会为 null

// 启用缓存
const { data, loading } = useRequest(
  async (id: string) => {
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  },
  {
    id: 'user-detail',
    cache: {
      maxAge: 5 * 60 * 1000 // 5 分钟
    }
  }
)

// 启用共享
const { data, loading } = useRequest(
  async (id: string) => {
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  },
  {
    id: 'user-detail',
    share: {
      maxAge: 10 * 1000 // 10 秒
    }
  }
)

// 监听缓存命中
const { data, loading } = useRequest(
  async (id: string) => {
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  },
  {
    id: 'user-detail',
    cache: true,
    onCacheHit: (cached) => {
      console.log('Cache hit:', cached)
    }
  }
)
```
