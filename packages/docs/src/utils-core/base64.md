---
outline: deep
---

# base64

Base64 编解码工具。

## 导入

```typescript
import { base64toBlob } from '@cloudcome/utils-core/base64';
```

## 函数

### base64toBlob

将 Base64 字符串转换为 Blob 对象。

```typescript
function base64toBlob(base64: string): Blob;
```

**参数**

| 参数   | 类型     | 描述                |
| ------ | -------- | ------------------- |
| base64 | `string` | Base64 编码的字符串 |

**返回值**

`Blob` - 转换后的 Blob 对象

**说明**

输入的 Base64 字符串必须包含 Data URI 前缀（如 `data:image/png;base64,...`），函数会自动解析 MIME 类型。

**示例**

```typescript
// 文本
const textBlob = base64toBlob('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==');
console.log(textBlob.type); // 'text/plain'
console.log(textBlob.size); // 13

// 图片（PNG）
const pngBlob = base64toBlob(
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
);
console.log(pngBlob.type); // 'image/png'

// JSON 数据
const jsonBlob = base64toBlob('data:application/json;base64,eyJrZXkiOiAidmFsdWUifQ==');
console.log(jsonBlob.type); // 'application/json'
console.log(jsonBlob.size); // 15
```
