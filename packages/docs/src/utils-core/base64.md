---
outline: deep
---

# base64

Base64 编解码工具。

## 导入

```typescript
import { base64toBlob } from '@cloudcome/utils-core/base64'
```

## 函数

### base64toBlob

将 Base64 字符串转换为 Blob 对象。

```typescript
function base64toBlob(base64: string): Blob
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| base64 | `string` | Base64 编码的字符串 |

**返回值**

`Blob` - 转换后的 Blob 对象

**示例**

```typescript
const base64 = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
const blob = base64toBlob(base64)
console.log(blob.size) // 13
```
