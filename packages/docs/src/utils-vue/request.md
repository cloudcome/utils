---
outline: deep
---

# request

请求组合式函数，支持缓存和共享等功能。

## 导入

```typescript
import { useRequest } from '@cloudcome/utils-vue/request'
import type { UseRequestOptions, RequestCacheOptions, RequestShareOptions, UseRequestState, UseRequestStateFilled, UseRequestOutput, UseRequestOutputFilled } from '@cloudcome/utils-vue/request'
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
| disabled | `boolean` | 是否禁用缓存。设为 `true` 时每次请求都会重新执行 |
| storage | `Cache<T>` | 自定义缓存存储，默认使用全局 `MemoryCache` |
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

### UseRequestState\<O\>

```typescript
interface UseRequestState<O> {
  times: number
  loading: boolean
  error: unknown
  data: O | null
  hitShare: boolean
  hitCache: boolean
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| times | `number` | 已执行次数 |
| loading | `boolean` | 是否正在加载 |
| error | `unknown` | 错误信息，无错误时为 `null` |
| data | `O \| null` | 返回数据，未执行时为 `null` |
| hitShare | `boolean` | 是否命中共享请求 |
| hitCache | `boolean` | 是否命中缓存 |

### UseRequestStateFilled\<O\>

```typescript
interface UseRequestStateFilled<O> {
  times: number
  loading: boolean
  error: unknown
  data: O
  hitShare: boolean
  hitCache: boolean
}
```

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

// 禁用缓存：即使 id 相同，每次请求都会重新执行
const { hitCache, sendAsync } = useRequest(
  async (id: string) => fetchUser(id),
  {
    id: 'user',
    cache: { disabled: true }
  }
)
await sendAsync('123')
await sendAsync('123')
// hitCache.value 始终为 false
// 请求函数被调用了 2 次

// 禁用共享：同步并发调用不会共享
const { hitShare, sendAsync } = useRequest(
  async () => fetchData(),
  {
    id: 'data',
    share: { disabled: true }
  }
)
const p1 = sendAsync()
const p2 = sendAsync()
await Promise.all([p1, p2])
// hitShare.value 为 false
// 请求函数被调用了 2 次

// 同步并发调用命中共享
const fn = async () => {
  await new Promise(r => setTimeout(r, 50))
  return { id: 1 }
}
const { hitShare: hs1, sendAsync: s1 } = useRequest(fn, {
  id: 'sync-test',
  share: true
})
const { hitShare: hs2, sendAsync: s2 } = useRequest(fn, {
  id: 'sync-test',
  share: true
})
const p1 = s1()
const p2 = s2() // 同步调用，共享尚未完成
await Promise.all([p1, p2])
// hs1.value = false（首次发起请求）
// hs2.value = true（命中共享的 Promise）
// fn 只被调用 1 次

// 不同 id 的请求不共享
const { hitShare: hs1 } = useRequest(fn, { id: 'id-1', share: true })
const { hitShare: hs2 } = useRequest(fn, { id: 'id-2', share: true })
await Promise.all([s1(), s2()])
// hs1.value = false, hs2.value = false
// fn 被调用 2 次

// 不传 id 时共享不生效
const { hitShare: hs1 } = useRequest(fn, { share: true })
const { hitShare: hs2 } = useRequest(fn, { share: true })
await Promise.all([s1(), s2()])
// hs1.value = false, hs2.value = false
// fn 被调用 2 次

// 共享与缓存同时使用，互不干扰
const { hitShare: hs, hitCache: hc, sendAsync } = useRequest(fn, {
  id: 'both',
  share: true,
  cache: true
})
// 首次调用：hs = false, hc = false
// 第二次调用（缓存已存在）：hs = false, hc = true
```
