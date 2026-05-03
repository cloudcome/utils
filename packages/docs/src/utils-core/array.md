---
outline: deep
---

# array

数组操作工具。

## 导入

```typescript
import { isArrayLike, arrayPick, arrayOmit, arrayEach, arrayEachAsync, arrayMove, arrayDiff, arrayRemove } from '@cloudcome/utils-core/array'
```

## 类型定义

### ArrayDiffs\<T\>

```typescript
interface ArrayDiffs<T> {
  deletes: T[]
  adds: T[]
  equals: T[]
}
```

### ArrayDiffOptions\<T\>

```typescript
interface ArrayDiffOptions<T> {
  getItemKey: (item: T) => unknown
}
```

## 函数

### isArrayLike

判断是否为类数组对象。

```typescript
function isArrayLike(unknown: unknown): boolean
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| unknown | `unknown` | 要检查的值 |

**返回值**

`boolean` - 是否为类数组对象

**示例**

```typescript
isArrayLike([1, 2, 3]) // true
isArrayLike('hello') // true
isArrayLike({ length: 3 }) // true
isArrayLike({}) // false
```

### arrayPick

从数组中选取指定索引的元素。

```typescript
function arrayPick<T>(array: T[], indexes: number[]): T[]
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| array | `T[]` | 源数组 |
| indexes | `number[]` | 要选取的索引数组 |

**返回值**

`T[]` - 选取的元素数组

**示例**

```typescript
const arr = ['a', 'b', 'c', 'd']
arrayPick(arr, [0, 2]) // ['a', 'c']
arrayPick(arr, [1, 3]) // ['b', 'd']
```

### arrayOmit

从数组中排除指定索引的元素。

```typescript
function arrayOmit<T>(array: T[], indexes: number[]): T[]
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| array | `T[]` | 源数组 |
| indexes | `number[]` | 要排除的索引数组 |

**返回值**

`T[]` - 排除后的数组

**示例**

```typescript
const arr = ['a', 'b', 'c', 'd']
arrayOmit(arr, [0, 2]) // ['b', 'd']
arrayOmit(arr, [1, 3]) // ['a', 'c']
```

### arrayEach

遍历数组。

```typescript
function arrayEach<T>(array: T[], iterator: (item: T, index: number) => false | unknown, reverse?: boolean): void
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| array | `T[]` | - | 要遍历的数组 |
| iterator | `(item: T, index: number) => false \| unknown` | - | 迭代函数，返回 `false` 可提前终止 |
| reverse | `boolean` | `false` | 是否反向遍历 |

**返回值**

`void`

**示例**

```typescript
const arr = [1, 2, 3, 4, 5]

arrayEach(arr, (item, index) => {
  console.log(index, item)
  if (item === 3) return false // 终止遍历
})
// 0 1
// 1 2
// 2 3
```

### arrayEachAsync

异步遍历数组。

```typescript
function arrayEachAsync<T>(array: T[], iterator: (item: T, index: number) => MaybePromise<false | unknown>, reverse?: boolean): Promise<void>
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| array | `T[]` | - | 要遍历的数组 |
| iterator | `(item: T, index: number) => MaybePromise<false \| unknown>` | - | 异步迭代函数 |
| reverse | `boolean` | `false` | 是否反向遍历 |

**返回值**

`Promise<void>`

**示例**

```typescript
const arr = [1, 2, 3, 4, 5]

await arrayEachAsync(arr, async (item, index) => {
  await new Promise(resolve => setTimeout(resolve, 100))
  console.log(index, item)
})
```

### arrayMove

移动数组中的元素。

```typescript
function arrayMove<T>(array: T[], from: number, to: number): T[]
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| array | `T[]` | 源数组 |
| from | `number` | 源索引 |
| to | `number` | 目标索引 |

**返回值**

`T[]` - 移动后的数组

**示例**

```typescript
const arr = ['a', 'b', 'c', 'd']
arrayMove(arr, 0, 2) // ['b', 'c', 'a', 'd']
arrayMove(arr, 3, 1) // ['a', 'd', 'b', 'c']
```

### arrayDiff

计算两个数组的差异。

```typescript
function arrayDiff<T>(refArray: T[], curArray: T[], options?: ArrayDiffOptions<T>): ArrayDiffs<T>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| refArray | `T[]` | 参考数组 |
| curArray | `T[]` | 当前数组 |
| options | `ArrayDiffOptions<T>` | 可选配置 |

**返回值**

`ArrayDiffs<T>` - 差异结果

**示例**

```typescript
const ref = [1, 2, 3, 4, 5]
const cur = [2, 4, 6]

const diff = arrayDiff(ref, cur)
// {
//   deletes: [1, 3, 5],
//   adds: [6],
//   equals: [2, 4]
// }

// 使用自定义 key
const refObj = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
const curObj = [{ id: 2, name: 'b' }, { id: 3, name: 'c' }]

const diffObj = arrayDiff(refObj, curObj, {
  getItemKey: item => item.id
})
```

### arrayRemove

从数组中移除指定索引的元素。

```typescript
function arrayRemove<T>(array: T[], indexes: number[]): T[]
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| array | `T[]` | 源数组 |
| indexes | `number[]` | 要移除的索引数组 |

**返回值**

`T[]` - 移除后的数组

**示例**

```typescript
const arr = ['a', 'b', 'c', 'd']
arrayRemove(arr, [0, 2]) // ['b', 'd']
arrayRemove(arr, [1, 3]) // ['a', 'c']
```
