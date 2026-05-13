---
outline: deep
---

# object

对象操作工具，提供对象遍历、合并、类型判断等功能。

## 导入

```typescript
import {
  objectEach,
  objectEachAsync,
  objectGet,
  objectSet,
  objectMerge,
  objectDefaults,
  objectPick,
  objectOmit,
  objectMap,
  objectFilter,
  isEmptyObject,
  isPlainObject
} from '@cloudcome/utils-core/object'
import type {
  ObjectPath,
  ObjectLeafPath,
  ObjectPathValue,
  ObjectNode,
  ObjectSetOptions,
  ObjectMergeRule
} from '@cloudcome/utils-core/object'
```

## 类型定义

### ObjectSetOptions\<O\>

```typescript
interface ObjectSetOptions<O> {
  beforeSet(node: ObjectNode<O> & { key: string }): boolean | undefined | void
  undefinedSet(node: ObjectNode<O>): AnyObject | AnyArray | undefined | void
}
```

### ObjectMergeRule

对象合并规则。

```typescript
interface ObjectMergeRule {
  next: (info: {
    target: AnyObject | AnyArray
    source: AnyObject | AnyArray
    key: string | number
  }) => boolean

  assign: (info: {
    target: AnyObject | AnyArray
    source: AnyObject | AnyArray
    key: string | number
    merge: () => any
  }) => any
}
```

### ObjectPath\<O, D\>

对象路径类型，递归获取对象的所有可能路径。

```typescript
type ObjectPath<O, D extends number = 4>
```

### ObjectLeafPath\<O, D\>

对象叶子路径类型，递归获取对象的所有叶子节点路径。

```typescript
type ObjectLeafPath<O, D extends number = 4>
```

### ObjectPathValue\<O, P\>

根据路径获取对象的值类型。

```typescript
type ObjectPathValue<O, P extends ObjectPath<O, 4>>
```

### ObjectNode\<V\>

对象节点类型，用于 `objectGet` 和 `objectSet` 的返回值。

```typescript
type ObjectNode<V = unknown | undefined> = {
  parent: unknown | undefined
  keys: string[]
  key: string | undefined
  value: V
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| parent | `unknown \| undefined` | 当前节点的父级对象 |
| keys | `string[]` | 当前节点的键名路径 |
| key | `string \| undefined` | 当前节点的键名 |
| value | `V` | 当前节点的键值 |

## 函数

### objectEach

遍历对象的可枚举属性。

```typescript
function objectEach<O extends AnyObject, K extends keyof O & (string | number)>(
  obj: O,
  iterator: (this: O, val: O[K], key: K) => false | unknown
): void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| obj | `O` | 要遍历的对象 |
| iterator | `(this: O, val: O[K], key: K) => false \| unknown` | 迭代函数，返回 `false` 可提前终止 |

**返回值**

`void`

**示例**

```typescript
const obj = { a: 1, b: 2, c: 3 }

objectEach(obj, (value, key) => {
  console.log(key, value)
})
// 'a' 1
// 'b' 2
// 'c' 3

// 提前终止
objectEach(obj, (value, key) => {
  if (key === 'b') return false
  console.log(key, value)
})
// 'a' 1
```

### objectEachAsync

异步遍历对象的可枚举属性。

```typescript
function objectEachAsync<O extends AnyObject, K extends keyof O & (string | number)>(
  obj: O,
  iterator: (this: O, val: O[K], key: K) => MaybePromise<false | unknown>
): Promise<void>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| obj | `O` | 要遍历的对象 |
| iterator | `(this: O, val: O[K], key: K) => MaybePromise<false \| unknown>` | 异步迭代函数，返回 `false` 可提前终止 |

**返回值**

`Promise<void>`

**示例**

```typescript
const obj = { a: 1, b: 2, c: 3 }

await objectEachAsync(obj, async (value, key) => {
  await promiseDelay(100)
  console.log(key, value)
})
// 'a' 1
// 'b' 2
// 'c' 3
```

### objectGet

深层获取对象属性值。

```typescript
function objectGet<O extends AnyObject, P extends ObjectPath<O>>(
  obj: O,
  path: P | string | string[]
): ObjectNode<O>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| obj | `O` | 源对象 |
| path | `P \| string \| string[]` | 属性路径，支持字符串（如 `'a.b.c'`）或数组（如 `['a', 'b', 'c']`） |

**返回值**

`ObjectNode<O>` - 包含父级、键名路径、键名和键值的对象节点

**示例**

```typescript
const obj = { a: { b: { c: 123 } } }

objectGet(obj, 'a.b.c').value // 123
objectGet(obj, ['a', 'b', 'c']).value // 123
objectGet(obj, 'a.b.d').value // undefined
```

### objectSet

深层设置对象属性值。

```typescript
function objectSet<O extends AnyObject, V>(
  obj: O,
  path: string | string[],
  val: V,
  options?: Partial<ObjectSetOptions<O>>
): ObjectNode<V>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| obj | `O` | 目标对象 |
| path | `string \| string[]` | 属性路径 |
| val | `V` | 要设置的值 |
| options | `Partial<ObjectSetOptions<O>>` | 可选配置 |

**返回值**

`ObjectNode<V>` - 包含父级、键名路径、键名和设置后键值的对象节点

**示例**

```typescript
const obj = { a: { b: { c: 1 } } }

objectSet(obj, 'a.b.c', 2)
console.log(obj.a.b.c) // 2

objectSet(obj, 'a.b.d', 3)
console.log(obj.a.b.d) // 3
```

### objectMerge

合并多个对象。

```typescript
function objectMerge(
  target: AnyObject | AnyArray,
  ...sources: (AnyObject | AnyArray)[]
): AnyObject | AnyArray
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| target | `AnyObject \| AnyArray` | 目标对象 |
| sources | `(AnyObject \| AnyArray)[]` | 要合并的源对象 |

**返回值**

`AnyObject | AnyArray` - 合并后的对象

**示例**

```typescript
const target = { a: 1, b: 2 }
const source1 = { b: 3, c: 4 }
const source2 = { d: 5 }

const result = objectMerge(target, source1, source2)
// { a: 1, b: 3, c: 4, d: 5 }
```

### objectDefaults

合并默认值（只填充 undefined 属性）。

```typescript
function objectDefaults<T extends AnyObject | AnyArray>(
  target: T,
  defaults: T
): T
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| target | `T` | 目标对象 |
| defaults | `T` | 默认值源对象 |

**返回值**

`T` - 合并后的对象

**示例**

```typescript
const target = { a: 1, b: undefined }
const defaults = { a: 10, b: 20, c: 30 }

const result = objectDefaults(target, defaults)
// { a: 1, b: 20, c: 30 }
```

### objectPick

从对象中选取指定属性。

```typescript
function objectPick<T extends AnyObject, K extends keyof T>(
  object: T,
  keys: K[]
): Pick<T, K>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| object | `T` | 源对象 |
| keys | `K[]` | 要选取的属性名数组 |

**返回值**

`Pick<T, K>` - 选取后的对象

**示例**

```typescript
const obj = { a: 1, b: 2, c: 3, d: 4 }

objectPick(obj, ['a', 'c']) // { a: 1, c: 3 }
objectPick(obj, ['b', 'd']) // { b: 2, d: 4 }
```

### objectOmit

从对象中排除指定属性。

```typescript
function objectOmit<T extends AnyObject, K extends keyof T>(
  object: T,
  keys: K[]
): Omit<T, K>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| object | `T` | 源对象 |
| keys | `K[]` | 要排除的属性名数组 |

**返回值**

`Omit<T, K>` - 排除后的对象

**示例**

```typescript
const obj = { a: 1, b: 2, c: 3, d: 4 }

objectOmit(obj, ['a', 'c']) // { b: 2, d: 4 }
objectOmit(obj, ['b', 'd']) // { a: 1, c: 3 }
```

### objectMap

遍历对象并对每个值执行映射函数，返回新对象。

```typescript
function objectMap<T extends AnyObject, V>(
  object: T,
  mapper: (value: T[keyof T], key: keyof T) => V
): Record<keyof T, V>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| object | `T` | 源对象 |
| mapper | `(value: T[keyof T], key: keyof T) => V` | 映射函数 |

**返回值**

`Record<keyof T, V>` - 映射后的新对象

**示例**

```typescript
const obj = { a: 1, b: 2, c: 3 }

objectMap(obj, (value, key) => value * 2)
// { a: 2, b: 4, c: 6 }

objectMap(obj, (value, key) => `${key}:${value}`)
// { a: 'a:1', b: 'b:2', c: 'c:3' }
```

### objectFilter

过滤对象属性，返回满足条件的新对象。

```typescript
function objectFilter<T extends AnyObject>(
  object: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| object | `T` | 源对象 |
| predicate | `(value: T[keyof T], key: keyof T) => boolean` | 过滤函数 |

**返回值**

`Partial<T>` - 过滤后的新对象

**示例**

```typescript
const obj = { a: 1, b: 2, c: 3, d: 4 }

objectFilter(obj, (value, key) => value > 2)
// { c: 3, d: 4 }

objectFilter(obj, (value, key) => key === 'a' || key === 'c')
// { a: 1, c: 3 }
```

### isEmptyObject

判断是否为空对象。

```typescript
function isEmptyObject(obj: AnyObject): boolean
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| obj | `AnyObject` | 要检查的对象 |

**返回值**

`boolean` - 是否为空对象

**示例**

```typescript
isEmptyObject({}) // true
isEmptyObject({ a: 1 }) // false
```

### isPlainObject

判断是否为普通对象。

```typescript
function isPlainObject(obj: AnyObject): boolean
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| obj | `AnyObject` | 要检查的对象 |

**返回值**

`boolean` - 是否为普通对象

**示例**

```typescript
isPlainObject({}) // true
isPlainObject({ a: 1 }) // true
isPlainObject(new Date()) // false
isPlainObject([]) // false
```
