---
outline: deep
---

# tree

树结构遍历工具，支持深度优先和广度优先遍历。

## 导入

```typescript
import {
  treeEach,
  treeFind,
  deepFlat,
  treeFrom,
  type TreeItem,
  type TreeList,
  type TreeWalker,
  type TreeInfo,
  type TreeEachIterator,
  type TreeEachIteratorAsync,
  type TreeWalk,
  type TreeWalkAsync,
  type TreeFromOptions,
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

### TreeFromOptions\<I\>

从列表构建树的配置选项。

```typescript
type TreeFromOptions<I extends TreeItem> = {
  idKey?: string
  parentKey?: string
  childrenKey?: string
  rootValue?: unknown
}
```

**属性说明**

| 属性 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| idKey | `string` | `'id'` | 节点 ID 的字段名 |
| parentKey | `string` | `'parentId'` | 父节点 ID 的字段名 |
| childrenKey | `string` | `'children'` | 子节点列表的字段名 |
| rootValue | `unknown` | `0` | 根节点的 parentKey 值 |

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

### treeFind

在树结构中查找符合条件的节点。

```typescript
function treeFind<I extends TreeItem>(
  treeList: TreeList<I>,
  predicate: (info: TreeInfo<I>) => boolean
): I | undefined
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| treeList | `TreeList<I>` | 要查找的树结构数组 |
| predicate | `(info: TreeInfo<I>) => boolean` | 判断条件函数 |

**返回值**

`I | undefined` - 找到的第一个节点，未找到返回 `undefined`

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

treeFind(tree, (info) => info.item.id === 3)
// { id: 3, children: [{ id: 4 }] }

treeFind(tree, (info) => info.item.id === 99)
// undefined
```

### deepFlat

将树结构扁平化为一维数组。

```typescript
function deepFlat<I extends TreeItem, T>(
  treeList: TreeList<I>,
  mapper: (info: TreeInfo<I>) => T,
  breadthFirst?: boolean
): T[]
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| treeList | `TreeList<I>` | - | 要扁平化的树结构数组 |
| mapper | `(info: TreeInfo<I>) => T` | - | 映射函数，将节点转换为目标类型 |
| breadthFirst | `boolean` | `false` | 是否使用广度优先遍历 |

**返回值**

`T[]` - 扁平化后的数组

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

deepFlat(tree, (info) => info.item.id)
// [1, 2, 3, 4]

deepFlat(tree, (info) => ({ id: info.item.id, level: info.level }))
// [
//   { id: 1, level: 1 },
//   { id: 2, level: 2 },
//   { id: 3, level: 2 },
//   { id: 4, level: 3 }
// ]
```

### treeFrom

从扁平列表构建树结构。

```typescript
function treeFrom<I extends TreeItem>(
  list: I[],
  options: TreeFromOptions<I>
): TreeList<I> | undefined
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| list | `I[]` | 扁平列表 |
| options | `TreeFromOptions<I>` | 配置选项 |

**返回值**

`TreeList<I> | undefined` - 构建的树结构

**示例**

```typescript
const list = [
  { id: 1, parentId: 0 },
  { id: 2, parentId: 1 },
  { id: 3, parentId: 1 },
  { id: 4, parentId: 3 }
]

treeFrom(list, {})
// [
//   {
//     id: 1, parentId: 0,
//     children: [
//       { id: 2, parentId: 1 },
//       { id: 3, parentId: 1, children: [{ id: 4, parentId: 3 }] }
//     ]
//   }
// ]
```
