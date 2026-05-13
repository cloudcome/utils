---
outline: deep
---

# cookie

Cookie 操作工具。

## 导入

```typescript
import { cookieGet, cookieSet, cookieDel } from '@cloudcome/utils-browser/cookie'
import type { CookieOptions } from '@cloudcome/utils-browser/cookie'
```

## 类型定义

### CookieOptions

```typescript
interface CookieOptions {
  expires?: DateValue
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  maxAge?: number
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| expires | `DateValue` | 过期时间 |
| path | `string` | Cookie 路径 |
| domain | `string` | Cookie 域名 |
| secure | `boolean` | 是否只在 HTTPS 下传输 |
| sameSite | `'strict' \| 'lax' \| 'none'` | SameSite 属性 |
| maxAge | `number` | 最大存活时间（秒） |

## 函数

### cookieGet

获取指定名称的 Cookie 值。

```typescript
function cookieGet(name: string): string
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| name | `string` | Cookie 名称 |

**返回值**

`string` - Cookie 值，如果不存在则返回空字符串

**示例**

```typescript
cookieGet('username') // 'john'
cookieGet('nonexistent') // ''
```

### cookieSet

设置 Cookie。

```typescript
function cookieSet(name: string, value: string, options?: CookieOptions): void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| name | `string` | Cookie 名称 |
| value | `string` | Cookie 值 |
| options | `CookieOptions` | 可选配置 |

**返回值**

`void`

**示例**

```typescript
// 基本用法
cookieSet('username', 'john')

// 设置过期时间（7 天）
cookieSet('username', 'john', { expires: 7 })

// 设置路径和域名
cookieSet('username', 'john', { path: '/', domain: '.example.com' })

// 设置 SameSite
cookieSet('username', 'john', { sameSite: 'strict' })

// 设置最大存活时间（秒）
cookieSet('username', 'john', { maxAge: 3600 })
```

### cookieDel

删除指定名称的 Cookie。

```typescript
function cookieDel(name: string): void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| name | `string` | Cookie 名称 |

**返回值**

`void`

**示例**

```typescript
cookieDel('username')
```
