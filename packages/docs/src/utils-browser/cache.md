---
outline: deep
---

# cache

浏览器缓存工具，基于 localStorage 和 sessionStorage。

## 导入

```typescript
import { StorageCache, createLocalCache, createSessionCache } from '@cloudcome/utils-browser/cache';
```

## 类型定义

继承自 `@cloudcome/utils-core/cache` 的类型：

### CacheOptions

```typescript
interface CacheOptions {
  maxAge?: number;
  expiredAt?: DateValue;
}
```

**属性说明**

| 属性      | 类型      | 默认值 | 描述                                                                    |
| --------- | --------- | ------ | ----------------------------------------------------------------------- |
| storage   | `Storage` | -      | 存储实现（`localStorage` 或 `sessionStorage`）                          |
| namespace | `string`  | `''`   | 缓存键前缀，用于隔离不同应用的缓存。设置时键格式为 `${namespace}:${id}` |

**方法**

#### get

获取缓存数据。

```typescript
get(id: string): Cached<T> | null
```

| 参数 | 类型     | 描述   |
| ---- | -------- | ------ |
| id   | `string` | 缓存键 |

**返回值**

`Cached<T> | null` - 缓存数据，不存在或已过期返回 `null`

**边界情况**

- 缓存不存在时返回 `null`
- 缓存已过期时自动删除过期数据并返回 `null`
- JSON 解析失败时返回 `null`（不会抛出异常）
- `storage.getItem` 抛出异常时返回 `null`（不会抛出异常）

#### set

存储缓存数据。

```typescript
set(id: string, data: T, options?: CacheOptions): void
```

| 参数    | 类型           | 描述         |
| ------- | -------------- | ------------ |
| id      | `string`       | 缓存键       |
| data    | `T`            | 要缓存的数据 |
| options | `CacheOptions` | 可选配置     |

#### del

删除指定缓存。

```typescript
del(id: string): void
```

| 参数 | 类型     | 描述   |
| ---- | -------- | ------ |
| id   | `string` | 缓存键 |

**边界情况**

- `storage.removeItem` 抛出异常时静默处理，不会抛出异常

#### clear

清空当前 Storage 中的所有数据（包括不属于当前命名空间的键）。

```typescript
clear(): void
```

> **注意**：`clear()` 调用的是 `Storage.clear()`，会清空整个存储区域的所有数据，而**不仅限于当前命名空间**。如需只清理当前命名空间下的缓存，请使用 `del()` 逐个删除。

**边界情况**

- `storage.clear` 抛出异常时静默处理，不会抛出异常
- `set` 方法中 `storage.setItem` 抛出异常时静默处理，不会抛出异常

**示例**

```typescript
// 直接使用 StorageCache
import { StorageCache } from '@cloudcome/utils-browser/cache';

const cache = new StorageCache<string>(localStorage, 'my-app');

// 设置缓存，1 小时后过期
cache.set('token', 'abc123', { maxAge: 60 * 60 * 1000 });

// 获取缓存
const result = cache.get('token');
if (result) {
  console.log(result.data); // 'abc123'
  console.log(result.createdAt); // 创建时间戳
  console.log(result.expiredAt); // 过期时间戳
}

// 删除单个缓存
cache.del('token');

// 清空整个 localStorage（慎用！）
cache.clear();
```

**缓存数据格式**

存储在 `localStorage`/`sessionStorage` 中的数据格式为：

```json
{
  "id": "token",
  "data": "abc123",
  "createdAt": 1700000000000,
  "maxAge": 3600000
}
```

- `id`：原始缓存键（不含命名空间前缀）
- `data`：缓存的数据（任意可 JSON 序列化的类型）
- `createdAt`：创建时的时间戳（毫秒）
- `maxAge`：缓存有效期（毫秒），0 表示永不过期
