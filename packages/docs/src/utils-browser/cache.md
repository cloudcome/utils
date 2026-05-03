---
outline: deep
---

# cache

浏览器缓存工具，基于 localStorage 和 sessionStorage。

## 导入

```typescript
import { createLocalCache, createSessionCache } from '@cloudcome/utils-browser/cache'
```

## 类型定义

继承自 `@cloudcome/utils-core/cache` 的类型：

- `CacheOptions`
- `Cached<T>`
- `Cache<T>`
- `AbstractCache<T>`

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

// 清空所有缓存（仅限当前命名空间）
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
