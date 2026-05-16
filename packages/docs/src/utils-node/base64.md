---
outline: deep
---

# base64

Base64 编解码工具。

## 导入

```typescript
import { encodeBase64, decodeBase64 } from '@cloudcome/utils-node/base64'
```

## 函数

### encodeBase64

将字符串编码为 Base64。

```typescript
function encodeBase64(input: string): string
```

**参数**

| 参数  | 类型     | 描述           |
| ----- | -------- | -------------- |
| input | `string` | 要编码的字符串 |

**返回值**

`string` - Base64 编码的字符串

**示例**

```typescript
encodeBase64('Hello, World!') // 'SGVsbG8sIFdvcmxkIQ=='
encodeBase64('你好') // '5L2g5aW9'
encodeBase64('') // ''
encodeBase64('!@#$%^&*()') // 'IUAjJCVeJiooKQ=='
```

### decodeBase64

将 Base64 字符串解码为普通字符串。

```typescript
function decodeBase64(input: string): string
```

**参数**

| 参数  | 类型     | 描述                |
| ----- | -------- | ------------------- |
| input | `string` | Base64 编码的字符串 |

**返回值**

`string` - 解码后的字符串

**示例**

```typescript
decodeBase64('SGVsbG8sIFdvcmxkIQ==') // 'Hello, World!'
decodeBase64('5L2g5aW9') // '你好'
decodeBase64('') // ''
decodeBase64('IUAjJCVeJiooKQ==') // '!@#$%^&*()'
```

### 编码/解码互操作

```typescript
// 往返一致性：编码后再解码，结果与原始字符串相同
const original = 'Hello, 世界!'
const encoded = encodeBase64(original)
const decoded = decodeBase64(encoded)
decoded === original // true
```

**说明**

Node.js 环境使用 `Buffer` 实现 Base64 编解码，与浏览器端的 `btoa`/`atob` 实现方式不同。支持 UTF-8 编码，可以正确编解码中文字符。
