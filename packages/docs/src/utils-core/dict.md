---
outline: deep
---

# dict

字典/枚举工具。

## 导入

```typescript
import { declareDict } from '@cloudcome/utils-core/dict'
```

## 函数

### declareDict

声明字典枚举。

```typescript
function declareDict<A extends DictMetaAppend>(): {
  define: <E extends DictEnum>(entries: E) => DictExpose<A, E>
}
```

**返回值**

返回一个 `define` 方法，用于定义字典枚举。

**示例**

```typescript
// 定义字典
const StatusDict = declareDict().define({
  pending: { label: '待处理', value: 0 },
  active: { label: '活跃', value: 1 },
  disabled: { label: '禁用', value: 2 }
})

// 使用字典
console.log(StatusDict.pending) // { label: '待处理', value: 0 }
console.log(StatusDict.getOptions()) // 获取所有选项
console.log(StatusDict.getLabelByValue(0)) // '待处理'
console.log(StatusDict.getValueByLabel('活跃')) // 1
```
