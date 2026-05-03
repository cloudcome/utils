---
outline: deep
---

# types

Vue 相关类型定义。

## 导入

```typescript
import type { ClassValue, ClassDictionary, ClassArray } from '@cloudcome/utils-vue/types'
```

## 类型定义

### ClassValue

```typescript
type ClassValue = ClassArray | ClassDictionary | string | number | bigint | null | boolean | undefined
```

**说明**

用于动态绑定 CSS 类名的类型，兼容 [clsx](https://github.com/lukeed/clsx) 的用法。

### ClassDictionary

```typescript
type ClassDictionary = Record<string, unknown>
```

**说明**

对象形式的类名，键为类名，值为布尔值表示是否应用。

### ClassArray

```typescript
type ClassArray = ClassValue[]
```

**说明**

数组形式的类名。

**示例**

```typescript
// 字符串
const cls1: ClassValue = 'foo bar'

// 对象
const cls2: ClassValue = {
  foo: true,
  bar: false,
  baz: true
}

// 数组
const cls3: ClassValue = ['foo', { bar: true }, ['baz']]

// 混合
const cls4: ClassValue = [
  'foo',
  {
    bar: true,
    baz: false
  },
  ['qux', { quux: true }]
]
```
