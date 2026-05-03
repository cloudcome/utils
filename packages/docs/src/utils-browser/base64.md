---
outline: deep
---

# base64

浏览器端 Base64 编解码工具。

## 导入

```typescript
import { encodeBase64, decodeBase64 } from '@cloudcome/utils-browser/base64'
```

## 函数

### encodeBase64

将字符串编码为 Base64。

```typescript
function encodeBase64(input: string): string
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| input | `string` | 要编码的字符串 |

**返回值**

`string` - Base64 编码的字符串

**示例**

```typescript
encodeBase64('Hello, World!') // 'SGVsbG8sIFdvcmxkIQ=='
encodeBase64('你好') // '5L2g5aW9'
```

### decodeBase64

将 Base64 字符串解码为普通字符串。

```typescript
function decodeBase64(input: string): string
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| input | `string` | Base64 编码的字符串 |

**返回值**

`string` - 解码后的字符串

**示例**

```typescript
decodeBase64('SGVsbG8sIFdvcmxkIQ==') // 'Hello, World!'
decodeBase64('5L2g5aW9') // '你好'
```
