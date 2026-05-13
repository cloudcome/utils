---
outline: deep
---

# cache

浏览器缓存工具，基于 localStorage 和 sessionStorage。

## 导入

```typescript
import { StorageCache, createLocalCache, createSessionCache } from '@cloudcome/utils-browser/cache'
```

## 类型定义

继承自 `@cloudcome/utils-core/cache` 的类型：

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
| expiredAt | `DateValue` | 缓存过期时间点，优先级高于 `maxAge` |

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
| expiredAt | `number` | 过期时间戳（0 表示永不过期） |

### Cache\<T\>

```typescript
interface Cache<T> {
  get(id: string): Cached<T> | null
  set(id: string, data: T, options?: CacheOptions): void
  del(id: string): void
}
```

## 函数

### createLocalCache

创建基于 localStorage 的缓存实例。

```typescript
function createLocalCache<T>(namespace?: string): AbstractCache<T>
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| namespace | `string` | `''` | 缓存命名空间，用于隔离不同应用的缓存 |

**返回值**

`AbstractCache<T>` - 缓存实例

**示例**

```typescript
const cache = createLocalCache<string>('my-app')

// 设置缓存
cache.set('user', 'Alice', { maxAge: 60 * 60 * 1000 }) // 1 小时过期

// 获取缓存
const cached = cache.get('user')
console.log(cached?.data) // 'Alice'

// 删除缓存
cache.del('user')

// 清空所有缓存
cache.clear()
```

### createSessionCache

创建基于 sessionStorage 的缓存实例。

```typescript
function createSessionCache<T>(namespace?: string): AbstractCache<T>
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| namespace | `string` | `''` | 缓存命名空间 |

**返回值**

`AbstractCache<T>` - 缓存实例

**示例**

```typescript
const cache = createSessionCache<number>('my-app')

// 设置缓存（会话级别，关闭标签页后失效）
cache.set('count', 42)

// 获取缓存
const cached = cache.get('count')
console.log(cached?.data) // 42
```

## 类

### StorageCache\<T\>

继承 `AbstractCache<T>`，基于浏览器 Storage（localStorage/sessionStorage）的缓存实现。

```typescript
class StorageCache<T> extends AbstractCache<T> {
  constructor(storage: Storage, namespace?: string)

  get(id: string): Cached<T> | null
  set(id: string, data: T, options?: CacheOptions): void
  del(id: string): void
  clear(): void
}
```

**构造函数参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| storage | `Storage` | - | 存储实现（`localStorage` 或 `sessionStorage`） |
| namespace | `string` | `''` | 缓存键前缀，用于隔离不同应用的缓存 |

**方法**

#### get

获取缓存数据。

```typescript
get(id: string): Cached<T> | null
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | `string` | 缓存键 |

**返回值**

`Cached<T> | null` - 缓存数据，不存在或已过期返回 `null`

#### set

存储缓存数据。

```typescript
set(id: string, data: T, options?: CacheOptions): void
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | `string` | 缓存键 |
| data | `T` | 要缓存的数据 |
| options | `CacheOptions` | 可选配置 |

#### del

删除指定缓存。

```typescript
del(id: string): void
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| id | `string` | 缓存键 |

#### clear

清空当前 Storage 中的所有数据（包括不属于当前命名空间的键）。

```typescript
clear(): void
```

> **注意**：`clear()` 调用的是 `Storage.clear()`，会清空整个存储区域的所有数据，而**不仅限于当前命名空间**。如需只清理当前命名空间下的缓存，请使用 `del()` 逐个删除。

**示例**

```typescript
// 直接使用 StorageCache
import { StorageCache } from '@cloudcome/utils-browser/cache'

const cache = new StorageCache<string>(localStorage, 'my-app')

// 设置缓存，1 小时后过期
cache.set('token', 'abc123', { maxAge: 60 * 60 * 1000 })

// 获取缓存
const result = cache.get('token')
if (result) {
  console.log(result.data)       // 'abc123'
  console.log(result.createdAt)  // 创建时间戳
  console.log(result.expiredAt)  // 过期时间戳
}

// 删除单个缓存
cache.del('token')

// 清空整个 localStorage（慎用！）
cache.clear()
```
