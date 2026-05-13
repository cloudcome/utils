---
outline: deep
---

# cache

缓存工具，提供内存缓存实现。

## 导入

```typescript
import { AbstractCache, MemoryCache, createMemCache } from '@cloudcome/utils-core/cache'
import type { CacheOptions, Cached, Cache } from '@cloudcome/utils-core/cache'
```

## 类型定义

### CacheOptions

```typescript
interface CacheOptions {
  maxAge?: number
  expiredAt?: DateValue
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| maxAge | `number` | 缓存过期时间（毫秒） |
| expiredAt | `DateValue` | 缓存过期时间点 |

### Cached\<T\>

```typescript
interface Cached<T> {
  id: string
  data: T
  createdAt: number
  expiredAt: number
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| id | `string` | 缓存 ID |
| data | `T` | 缓存数据 |
| createdAt | `number` | 创建时间戳 |
| expiredAt | `number` | 过期时间戳 |

### Cache\<T\>

```typescript
interface Cache<T> {
  get(id: string): MaybePromise<Cached<T> | null>
  set(id: string, data: T, options?: CacheOptions): MaybePromise<void>
  del(id: string): MaybePromise<void>
}
```

## 函数

### createMemCache

创建内存缓存实例。

```typescript
function createMemCache<T>(): MemoryCache<T>
```

**返回值**

`MemoryCache<T>` - 内存缓存实例

**示例**

```typescript
const cache = createMemCache<string>()

// 设置缓存
cache.set('key', 'value', { maxAge: 60 * 1000 }) // 1 分钟过期

// 获取缓存
const cached = cache.get('key')
console.log(cached?.data) // 'value'

// 删除缓存
cache.del('key')
```

## 类

### AbstractCache\<T\>

缓存抽象基类，实现 `Cache<T>` 接口。

```typescript
abstract class AbstractCache<T> implements Cache<T> {
  abstract get(id: string): MaybePromise<Cached<T> | null>
  abstract set(id: string, data: T, options?: CacheOptions): MaybePromise<void>
  abstract del(id: string): MaybePromise<void>
}
```

### MemoryCache\<T\>

内存缓存实现。

```typescript
class MemoryCache<T> implements Cache<T> {
  get(id: string): Cached<T> | null
  set(id: string, data: T, options?: CacheOptions): void
  del(id: string): void
  clear(): void
}
```

**方法**

#### get

获取缓存。

```typescript
get(id: string): Cached<T> | null
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | `string` | 缓存 ID |

**返回值**

`Cached<T> | null` - 缓存数据，如果不存在或已过期则返回 `null`

#### set

设置缓存。

```typescript
set(id: string, data: T, options?: CacheOptions): void
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | `string` | 缓存 ID |
| data | `T` | 缓存数据 |
| options | `CacheOptions` | 可选配置 |

#### del

删除缓存。

```typescript
del(id: string): void
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | `string` | 缓存 ID |

#### clear

清空所有缓存。

```typescript
clear(): void
```

**示例**

```typescript
const cache = new MemoryCache<string>()

// 设置缓存
cache.set('user:1', 'Alice', { maxAge: 5 * 60 * 1000 }) // 5 分钟
cache.set('user:2', 'Bob', { expiredAt: new Date('2024-12-31') })

// 获取缓存
const user1 = cache.get('user:1')
if (user1) {
  console.log(user1.data) // 'Alice'
  console.log(user1.createdAt) // 创建时间戳
  console.log(user1.expiredAt) // 过期时间戳
}

// 删除缓存
cache.del('user:1')

// 清空所有缓存
cache.clear()
```
