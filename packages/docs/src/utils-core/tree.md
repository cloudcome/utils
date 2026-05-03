---
outline: deep
---

# tree

树结构操作工具。

## 导入

```typescript
import { treeEach, treeFind, treeFilter, treeMap, treeToList } from '@cloudcome/utils-core/tree'
```

## 类型定义

### TreeNode

```typescript
interface TreeNode {
  children?: TreeNode[]
  [key: string]: unknown
}
```

## 函数

### treeEach

遍历树结构。

```typescript
function treeEach<T extends TreeNode>(
  tree: T[],
  iterator: (node: T, parent: T | null, level: number) => false | unknown,
  options?: TreeOptions
): void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| tree | `T[]` | 树结构数组 |
| iterator | `(node: T, parent: T \| null, level: number) => false \| unknown` | 迭代函数，返回 `false` 可提前终止 |
| options | `TreeOptions` | 可选配置 |

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

treeEach(tree, (node, parent, level) => {
  console.log(`Level ${level}:`, node.id)
})
// Level 0: 1
// Level 1: 2
// Level 1: 3
// Level 2: 4
```

### treeFind

查找树节点。

```typescript
function treeFind<T extends TreeNode>(
  tree: T[],
  predicate: (node: T, parent: T | null, level: number) => boolean,
  options?: TreeOptions
): T | undefined
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| tree | `T[]` | 树结构数组 |
| predicate | `(node: T, parent: T \| null, level: number) => boolean` | 查找条件 |
| options | `TreeOptions` | 可选配置 |

**返回值**

`T | undefined` - 找到的节点

**示例**

```typescript
const tree = [
  {
    id: 1,
    children: [
      { id: 2 },
      { id: 3 }
    ]
  }
]

const node = treeFind(tree, (node) => node.id === 3)
console.log(node) // { id: 3 }
```

### treeFilter

过滤树结构。

```typescript
function treeFilter<T extends TreeNode>(
  tree: T[],
  predicate: (node: T, parent: T | null, level: number) => boolean,
  options?: TreeOptions
): T[]
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| tree | `T[]` | 树结构数组 |
| predicate | `(node: T, parent: T \| null, level: number) => boolean` | 过滤条件 |
| options | `TreeOptions` | 可选配置 |

**返回值**

`T[]` - 过滤后的树结构

**示例**

```typescript
const tree = [
  {
    id: 1,
    children: [
      { id: 2, active: true },
      { id: 3, active: false }
    ]
  }
]

const filtered = treeFilter(tree, (node) => node.active)
// [{ id: 1, children: [{ id: 2, active: true }] }]
```

### treeMap

映射树结构。

```typescript
function treeMap<T extends TreeNode, R extends TreeNode>(
  tree: T[],
  mapper: (node: T, parent: T | null, level: number) => R,
  options?: TreeOptions
): R[]
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| tree | `T[]` | 树结构数组 |
| mapper | `(node: T, parent: T \| null, level: number) => R` | 映射函数 |
| options | `TreeOptions` | 可选配置 |

**返回值**

`R[]` - 映射后的树结构

**示例**

```typescript
const tree = [
  {
    id: 1,
    children: [
      { id: 2 },
      { id: 3 }
    ]
  }
]

const mapped = treeMap(tree, (node) => ({
  ...node,
  label: `Node ${node.id}`
}))
```

### treeToList

将树结构转换为扁平列表。

```typescript
function treeToList<T extends TreeNode>(
  tree: T[],
  options?: TreeOptions
): T[]
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| tree | `T[]` | 树结构数组 |
| options | `TreeOptions` | 可选配置 |

**返回值**

`T[]` - 扁平列表

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

const list = treeToList(tree)
// [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
```
