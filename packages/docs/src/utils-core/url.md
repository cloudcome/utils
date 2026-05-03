---
outline: deep
---

# url

URL 解析与构建工具。

## 导入

```typescript
import { urlParse, urlStringify } from '@cloudcome/utils-core/url'
```

## 类型定义

### UrlMeta

```typescript
interface UrlMeta {
  protocol: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  origin: string
  path: string
  query: Record<string, string>
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| protocol | `string` | 协议，如 `'https:'` |
| host | `string` | 主机名 + 端口，如 `'example.com:8080'` |
| hostname | `string` | 主机名，如 `'example.com'` |
| port | `string` | 端口，如 `'8080'` |
| pathname | `string` | 路径，如 `'/path/to/page'` |
| search | `string` | 查询字符串，如 `'?key=value'` |
| hash | `string` | 哈希，如 `'#section'` |
| origin | `string` | 源，如 `'https://example.com:8080'` |
| path | `string` | 路径 + 查询字符串，如 `'/path/to/page?key=value'` |
| query | `Record<string, string>` | 解析后的查询参数对象 |

## 函数

### urlParse

解析 URL 字符串。

```typescript
function urlParse(url: string): UrlMeta
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| url | `string` | URL 字符串 |

**返回值**

`UrlMeta` - 解析后的 URL 对象

**示例**

```typescript
const meta = urlParse('https://example.com:8080/path?key=value#section')
console.log(meta.protocol) // 'https:'
console.log(meta.hostname) // 'example.com'
console.log(meta.port) // '8080'
console.log(meta.pathname) // '/path'
console.log(meta.search) // '?key=value'
console.log(meta.hash) // '#section'
console.log(meta.query) // { key: 'value' }
```

### urlStringify

将 URL 对象转换为字符串。

```typescript
function urlStringify(url: UrlMeta): string
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| url | `UrlMeta` | URL 对象 |

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
  origin: 'https://example.com:8080',
  path: '/path?key=value',
  query: { key: 'value' }
})
console.log(url) // 'https://example.com:8080/path?key=value#section'
```
