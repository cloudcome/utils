---
outline: deep
---

# tree

树结构遍历工具，支持深度优先和广度优先遍历。

## 导入

```typescript
import {
  treeEach,
  type TreeItem,
  type TreeList,
  type TreeWalker,
  type TreeInfo,
  type TreeEachIterator,
  type TreeEachIteratorAsync,
  type TreeWalk,
  type TreeWalkAsync,
} from '@cloudcome/utils-core/tree'
```

## 类型定义

### TreeItem

树节点类型。

```typescript
type TreeItem = AnyObject & {
  children?: TreeItem[]
}
```

### TreeList\<I\>

树节点列表类型。

```typescript
type TreeList<I extends TreeItem> = I[]
```

### TreeWalker\<I\>

遍历器状态。

```typescript
type TreeWalker<I extends TreeItem> = {
  list: TreeList<I>
  parent: I | null
  level: number
  path: TreeList<I>
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| list | `TreeList<I>` | 当前层级的节点列表 |
| parent | `I \| null` | 当前节点的父节点，根节点为 `null` |
| level | `number` | 当前节点的层级，从 1 开始 |
| path | `TreeList<I>` | 从根节点到当前节点的路径 |

### TreeInfo\<I\>

遍历节点信息。

```typescript
type TreeInfo<I extends TreeItem> = TreeWalker<I> & {
  item: I
  index: number
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| item | `I` | 当前节点 |
| index | `number` | 当前节点在 `list` 中的索引 |

### TreeEachIterator\<I\>

同步迭代器函数类型。

```typescript
type TreeEachIterator<I extends TreeItem> = (info: TreeInfo<I>) => false | unknown
```

### TreeEachIteratorAsync\<I\>

异步迭代器函数类型。

```typescript
type TreeEachIteratorAsync<I extends TreeItem> = (info: TreeInfo<I>) => Promise<boolean | unknown>
```

## 函数

### treeEach

深度遍历树结构中的每个节点。

```typescript
function treeEach<I extends TreeItem = TreeItem>(
  treeList: TreeList<I>,
  iterator: TreeEachIterator<I>,
  breadthFirst?: boolean
): void
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| treeList | `TreeList<I>` | - | 要遍历的树结构数组 |
| iterator | `TreeEachIterator<I>` | - | 对每个节点执行的回调函数，返回 `false` 可提前终止 |
| breadthFirst | `boolean` | `false` | 是否使用广度优先遍历，默认深度优先 |

**返回值**

`void`

**示例**

```typescript
const tree = [
  {
    id: 1,
    children: [
      { id: 2 },
      { id: 3, children: [{ id: 4 }] }
    ]
  }
]

// 深度优先遍历（默认）
treeEach(tree, (info) => {
  console.log(`Level ${info.level}:`, info.item.id)
})
// Level 1: 1
// Level 2: 2
// Level 2: 3
// Level 3: 4

// 广度优先遍历
treeEach(tree, (info) => {
  console.log(`Level ${info.level}:`, info.item.id)
}, true)
// Level 1: 1
// Level 2: 2
// Level 2: 3
// Level 3: 4

// 提前终止
treeEach(tree, (info) => {
  if (info.item.id === 2) return false
  console.log(info.item.id)
})
// 1
```
