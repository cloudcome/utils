---
outline: deep
---

# dom

DOM 操作工具。

## 导入

```typescript
import { setStyle, getStyle } from '@cloudcome/utils-browser/dom'
import type { Style } from '@cloudcome/utils-browser/dom'
```

## 类型定义

### Style

```typescript
type Style = {
  [K in keyof CSSStyleDeclaration as K extends number ? never : CSSStyleDeclaration[K] extends string | number ? K : never]: CSSStyleDeclaration[K]
}
```

**说明**

该类型过滤了 `CSSStyleDeclaration` 中的数字索引和非字符串/数字类型的属性，只保留可用的样式属性。

## 函数

### setStyle

设置元素样式。

```typescript
function setStyle(el: HTMLElement, style: string | Partial<Style> | Record<string, string>): void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| el | `HTMLElement` | 目标元素 |
| style | `string \| Partial<Style> \| Record<string, string>` | 样式，可以是字符串、Style 对象或普通对象 |

**返回值**

`void`

**示例**

```typescript
const el = document.getElementById('my-element')!

// 字符串形式
setStyle(el, 'color: red; font-size: 16px;')

// 对象形式
setStyle(el, {
  color: 'red',
  fontSize: '16px',
  backgroundColor: '#fff'
})

// 普通对象形式
setStyle(el, {
  'color': 'red',
  'font-size': '16px'
})
```

### getStyle

获取元素样式。

```typescript
function getStyle(el: HTMLElement, style: keyof Style): string
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| el | `HTMLElement` | 目标元素 |
| style | `keyof Style` | 样式属性名 |

**返回值**

`string` - 样式值

**示例**

```typescript
const el = document.getElementById('my-element')!

const color = getStyle(el, 'color') // 'rgb(255, 0, 0)'
const fontSize = getStyle(el, 'fontSize') // '16px'
const display = getStyle(el, 'display') // 'block'
```
