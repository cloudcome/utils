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

| 参数 | 类型     | 描述         |
| ---- | -------- | ------------ |
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

该函数使用 `document.execCommand('copy')` 实现，通过临时创建 `<textarea>` 元素、选中内容、执行复制命令、最后移除临时元素来完成复制操作。无论复制成功与否，临时元素都会被清理，不会在 DOM 中留下残留。

如需使用现代的 Clipboard API：

```typescript
// Clipboard API 方式
await navigator.clipboard.writeText('Hello, World!')
```
