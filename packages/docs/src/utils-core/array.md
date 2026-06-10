---
outline: deep
---

# array

数组操作工具函数。

## 导入

```typescript
import {
  isArrayLike,
  arrayPick,
  arrayOmit,
  arrayEach,
  arrayEachAsync,
  arrayMove,
  arrayRemove,
  arrayDiff,
  arraySample,
  type ArrayDiffs,
  type ArrayDiffOptions,
  type ArraySampleOptions,
} from '@cloudcome/utils-core/array';
```

## 类型定义

### ArrayDiffs\<T\>

数组差异结果类型。

```typescript
type ArrayDiffs<T> = {
  deletes: {
    refIndexes: number[];
    refValues: T[];
  }[];
  adds: {
    curIndexes: number[];
    curValues: T[];
  }[];
  equals: {
    refIndexes: number[];
    curIndexes: number[];
    refValues: T[];
    curValues: T[];
  }[];
};
```

**属性说明**

| 属性    | 类型    | 描述                                                                                    |
| ------- | ------- | --------------------------------------------------------------------------------------- |
| deletes | `Array` | 被删除的元素列表，包含 `refIndexes`（参考数组中的索引）和 `refValues`（被删除的元素值） |
| adds    | `Array` | 新增的元素列表，包含 `curIndexes`（当前数组中的索引）和 `curValues`（新增的元素值）     |
| equals  | `Array` | 相同的元素列表，包含 `refIndexes`、`curIndexes`、`refValues`、`curValues`               |

### ArrayDiffOptions\<T\>

数组差异比较的配置选项。

```typescript
type ArrayDiffOptions<T> = {
  getItemKey: (item: T) => unknown;
};
```

**属性说明**

| 属性       | 类型                   | 描述                                   |
| ---------- | ---------------------- | -------------------------------------- |
| getItemKey | `(item: T) => unknown` | 获取元素唯一标识的函数，默认为元素自身 |

### ArraySampleOptions

数组随机取样的配置选项。

```typescript
type ArraySampleOptions = {
  count?: number;
  ordered?: boolean;
  replacement?: boolean;
};
```

**属性说明**

| 属性        | 类型      | 默认值  | 描述                                            |
| ----------- | --------- | ------- | ----------------------------------------------- |
| count       | `number`  | `1`     | 取样数量，小数向下取整，负数归零                |
| ordered     | `boolean` | `false` | 是否保持原数组顺序，`false` 时结果顺序随机      |
| replacement | `boolean` | `false` | 是否有放回取样，`true` 时同一元素可能被多次选中 |

## 函数

### isArrayLike

判断是否为类数组对象。

```typescript
function isArrayLike(unknown: unknown): boolean;
```

**参数**

| 参数    | 类型      | 描述       |
| ------- | --------- | ---------- |
| unknown | `unknown` | 要检查的值 |

**返回值**

`boolean` - 是否为类数组对象

**示例**

```typescript
isArrayLike([1, 2, 3]); // true
isArrayLike({ length: 3 }); // true
isArrayLike('hello'); // false
isArrayLike({}); // false
```

### arrayPick

从数组中选择指定索引的元素。

```typescript
function arrayPick<T>(array: T[], indexes: number[]): T[];
```

**参数**

| 参数    | 类型       | 描述             |
| ------- | ---------- | ---------------- |
| array   | `T[]`      | 原始数组         |
| indexes | `number[]` | 要选择的索引数组 |

**返回值**

`T[]` - 包含指定索引元素的新数组

**示例**

```typescript
arrayPick(['a', 'b', 'c', 'd'], [0, 2]); // ['a', 'c']
```

### arrayOmit

从数组中排除指定索引的元素。

```typescript
function arrayOmit<T>(array: T[], indexes: number[]): T[];
```

**参数**

| 参数    | 类型       | 描述             |
| ------- | ---------- | ---------------- |
| array   | `T[]`      | 原始数组         |
| indexes | `number[]` | 要排除的索引数组 |

**返回值**

`T[]` - 排除指定索引元素后的新数组

**示例**

```typescript
arrayOmit(['a', 'b', 'c', 'd'], [0, 2]); // ['b', 'd']
```

### arrayEach

遍历数组中的每个元素。

```typescript
function arrayEach<T>(array: T[], iterator: (item: T, index: number) => false | unknown, reverse?: boolean): void;
```

**参数**

| 参数     | 类型                                           | 默认值  | 描述                              |
| -------- | ---------------------------------------------- | ------- | --------------------------------- |
| array    | `T[]`                                          | -       | 要遍历的数组                      |
| iterator | `(item: T, index: number) => false \| unknown` | -       | 回调函数，返回 `false` 可提前终止 |
| reverse  | `boolean`                                      | `false` | 是否反向遍历                      |

**返回值**

`void`

**示例**

```typescript
const arr = [1, 2, 3, 4, 5];

arrayEach(arr, (item, index) => {
  console.log(item, index);
  if (index === 2) return false; // 提前终止
});
// 1 0
// 2 1
// 3 2

// 反向遍历
arrayEach(arr, (item) => console.log(item), true);
// 5, 4, 3, 2, 1
```

### arrayEachAsync

异步遍历数组中的每个元素。

```typescript
function arrayEachAsync<T>(
  array: T[],
  iterator: (item: T, index: number) => MaybePromise<false | unknown>,
  reverse?: boolean,
): Promise<void>;
```

**参数**

| 参数     | 类型                                                         | 默认值  | 描述                                  |
| -------- | ------------------------------------------------------------ | ------- | ------------------------------------- |
| array    | `T[]`                                                        | -       | 要遍历的数组                          |
| iterator | `(item: T, index: number) => MaybePromise<false \| unknown>` | -       | 异步回调函数，返回 `false` 可提前终止 |
| reverse  | `boolean`                                                    | `false` | 是否反向遍历                          |

**返回值**

`Promise<void>`

**示例**

```typescript
const arr = [1, 2, 3];

await arrayEachAsync(arr, async (item, index) => {
  await promiseDelay(100);
  console.log(item);
});
// 1, 2, 3（依次输出，每次间隔 100ms）
```

### arrayMove

将数组中的元素移动到指定位置。

```typescript
function arrayMove<T>(array: T[], from: number, to: number): T[];
```

**参数**

| 参数  | 类型     | 描述                 |
| ----- | -------- | -------------------- |
| array | `T[]`    | 原始数组             |
| from  | `number` | 要移动元素的起始索引 |
| to    | `number` | 目标索引             |

**返回值**

`T[]` - 移动后的新数组

**示例**

```typescript
arrayMove([1, 2, 3, 4, 5], 1, 3); // [1, 3, 4, 2, 5]
```

**边界情况**

```typescript
// 索引越界时返回原数组副本
arrayMove([1, 2, 3], -1, 1); // [1, 2, 3]
arrayMove([1, 2, 3], 0, 5); // [1, 2, 3]
arrayMove([1, 2, 3], 5, 0); // [1, 2, 3]
```

### arrayRemove

从数组中移除指定索引的元素。

```typescript
function arrayRemove<T>(array: T[], indexes: number[]): T[];
```

**参数**

| 参数    | 类型       | 描述             |
| ------- | ---------- | ---------------- |
| array   | `T[]`      | 原始数组         |
| indexes | `number[]` | 要移除的索引数组 |

**返回值**

`T[]` - 移除后的新数组

**示例**

```typescript
arrayRemove([1, 2, 3, 4, 5], [1, 3]); // [1, 3, 5]
arrayRemove(['a', 'b', 'c'], [0]); // ['b', 'c']
```

### arrayDiff

比较两个数组的差异。

```typescript
function arrayDiff<T>(refArray: T[], curArray: T[], options?: ArrayDiffOptions<T>): ArrayDiffs<T>;
```

**参数**

| 参数     | 类型                  | 描述                 |
| -------- | --------------------- | -------------------- |
| refArray | `T[]`                 | 参考数组（原始数组） |
| curArray | `T[]`                 | 当前数组（比较数组） |
| options  | `ArrayDiffOptions<T>` | 可选，配置选项       |

**返回值**

`ArrayDiffs<T>` - 包含差异信息的对象

**示例**

```typescript
const ref = [1, 2, 3];
const cur = [2, 3, 4];
const diff = arrayDiff(ref, cur);
// {
//   deletes: [{ refIndexes: [0], refValues: [1] }],
//   adds: [{ curIndexes: [2], curValues: [4] }],
//   equals: [
//     { refIndexes: [1], curIndexes: [0], refValues: [2], curValues: [2] },
//     { refIndexes: [2], curIndexes: [1], refValues: [3], curValues: [3] }
//   ]
// }

// 使用自定义 key 函数
const ref2 = [{ id: 1 }, { id: 2 }];
const cur2 = [{ id: 2 }, { id: 3 }];
const diff2 = arrayDiff(ref2, cur2, { getItemKey: (item) => item.id });
```

### arraySample

从数组中随机取样指定数量的元素。

```typescript
function arraySample<T>(array: T[], options?: ArraySampleOptions): T[];
```

**类型参数**

| 参数 | 约束 | 描述     |
| ---- | ---- | -------- |
| T    | -    | 元素类型 |

**参数**

| 参数    | 类型                 | 描述     |
| ------- | -------------------- | -------- |
| array   | `T[]`                | 原始数组 |
| options | `ArraySampleOptions` | 可选配置 |

**返回值**

`T[]` - 取样结果的新数组（始终返回数组，即使只取 1 个元素）

**示例**

```typescript
const arr = [1, 2, 3, 4, 5];

// 默认取 1 个元素
arraySample(arr);
// => [3]

// 无序、无放回取 3 个
arraySample(arr, { count: 3 });
// => [5, 1, 3]

// 保持顺序、无放回
arraySample(arr, { count: 3, ordered: true });
// => [1, 3, 4]

// 有放回取样，可能重复
arraySample(arr, { count: 3, replacement: true });
// => [4, 2, 4]

// 保持顺序且有放回
arraySample(arr, { count: 3, ordered: true, replacement: true });
// => [1, 1, 3]
```

**边界情况**

```typescript
// count 为小数向下取整
arraySample(arr, { count: 2.7 });
// => [2, 5]

// count 为 0 或负数返回空数组
arraySample(arr, { count: 0 });
// => []

// 空数组始终返回空数组
arraySample([]);
// => []

// 无放回时 count 大于数组长度返回全部
arraySample(arr, { count: 10 });
// => [3, 1, 5, 2, 4]（全部 5 个元素，顺序随机）

// 不修改原数组
arr; // [1, 2, 3, 4, 5]（不变）
```
