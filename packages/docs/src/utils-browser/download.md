---
outline: deep
---

# download

文件下载工具。

## 导入

```typescript
import { downloadURL, downloadBlob } from '@cloudcome/utils-browser/download'
```

## 函数

### downloadURL

下载 URL 指向的文件。

```typescript
function downloadURL(url: string, filename?: string): void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| url | `string` | 文件 URL |
| filename | `string` | 可选，下载后的文件名 |

**返回值**

`void`

**示例**

```typescript
// 基本用法
downloadURL('https://example.com/file.pdf')

// 指定文件名
downloadURL('https://example.com/file.pdf', 'document.pdf')
```

### downloadBlob

下载 Blob 对象为文件。

```typescript
function downloadBlob(blob: Blob, filename?: string): void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| blob | `Blob` | Blob 对象 |
| filename | `string` | 可选，下载后的文件名 |

**返回值**

`void`

**示例**

```typescript
// 下载文本文件
const textBlob = new Blob(['Hello, World!'], { type: 'text/plain' })
downloadBlob(textBlob, 'hello.txt')

// 下载 JSON 文件
const jsonBlob = new Blob([JSON.stringify({ key: 'value' }, null, 2)], { type: 'application/json' })
downloadBlob(jsonBlob, 'data.json')

// 下载图片
const response = await fetch('https://example.com/image.jpg')
const imageBlob = await response.blob()
downloadBlob(imageBlob, 'image.jpg')
```
