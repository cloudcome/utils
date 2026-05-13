---
outline: deep
---

# clipboard

剪贴板操作工具。

## 导入

```typescript
import { copyText } from '@cloudcome/utils-browser/clipboard'
```

## 函数

### copyText

将文本复制到剪贴板。

```typescript
function copyText(text: string): void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| text | `string` | 要复制的文本 |

**返回值**

`void`

**示例**

```typescript
// 复制文本
copyText('Hello, World!')

// 在用户交互中使用
button.addEventListener('click', () => {
  copyText('复制成功！')
  alert('已复制到剪贴板')
})
```

**注意**

该函数使用 `document.execCommand('copy')` 实现，兼容大多数浏览器环境。如需使用现代的 Clipboard API：

```typescript
// Clipboard API 方式
await navigator.clipboard.writeText('Hello, World!')
```
