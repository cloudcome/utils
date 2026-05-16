---
outline: deep
---

# url

URL 解析与构建工具。

## 导入

```typescript
import { urlParse, urlStringify, type UrlMeta } from '@cloudcome/utils-core/url'
```

## 类型定义

### UrlMeta

URL 元信息。

```typescript
type UrlMeta = {
  protocol: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  username: string
  password: string
}
```

**属性说明**

| 属性     | 类型     | 描述                                                |
| -------- | -------- | --------------------------------------------------- |
| protocol | `string` | 协议部分，包含冒号，如 `'https:'`                   |
| host     | `string` | 主机部分，包括主机名和端口，如 `'example.com:8080'` |
| hostname | `string` | 主机名，如 `'example.com'`                          |
| port     | `string` | 端口，如 `'8080'`                                   |
| pathname | `string` | 路径部分，如 `'/path/to/page'`                      |
| search   | `string` | 查询字符串，如 `'?key=value'`                       |
| hash     | `string` | 哈希部分，如 `'#section'`                           |
| username | `string` | 用户名部分                                          |
| password | `string` | 密码部分                                            |

## 函数

### urlParse

解析 URL 字符串为组件对象。

```typescript
function urlParse(url: string): UrlMeta
```

**参数**

| 参数 | 类型     | 描述       |
| ---- | -------- | ---------- |
| url  | `string` | URL 字符串 |

**返回值**

`UrlMeta` - 解析后的 URL 对象

**示例**

```typescript
const meta = urlParse('https://user:pass@example.com:8080/path?key=value#section')
console.log(meta.protocol) // 'https:'
console.log(meta.hostname) // 'example.com'
console.log(meta.port) // '8080'
console.log(meta.pathname) // '/path'
console.log(meta.search) // '?key=value'
console.log(meta.hash) // '#section'
console.log(meta.username) // 'user'
console.log(meta.password) // 'pass'
```

### urlStringify

将 UrlMeta 对象转换回 URL 字符串。

```typescript
function urlStringify(url: UrlMeta): string
```

**参数**

| 参数 | 类型      | 描述     |
| ---- | --------- | -------- |
| url  | `UrlMeta` | URL 对象 |

**返回值**

`string` - URL 字符串

**示例**

```typescript
const url = urlStringify({
  protocol: 'https:',
  host: 'example.com:8080',
  hostname: 'example.com',
  port: '8080',
  pathname: '/path',
  search: '?key=value',
  hash: '#section',
  username: 'user',
  password: 'pass',
})
console.log(url) // 'https://user:pass@example.com:8080/path?key=value#section'
```
