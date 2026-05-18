---
outline: deep
---

# dict

字典/枚举工具，提供类型安全的枚举定义与查询。

## 导入

```typescript
import {
  declareDict,
  type DictKey,
  type DictValue,
  type DictMetaAppend,
  type DictMeta,
  type DictDescription,
  type DictExpose,
} from '@cloudcome/utils-core/dict';
```

## 类型定义

### DictKey

字典键类型。

```typescript
type DictKey = string;
```

### DictValue

字典值类型。

```typescript
type DictValue = number | string;
```

### DictMetaAppend

字典元数据附加属性类型。

```typescript
type DictMetaAppend = {
  key?: string;
  value?: string | number;
  [key: string]: any;
};
```

### DictMeta\<A\>

字典元数据类型。

```typescript
type DictMeta<A extends DictMetaAppend> = A & {
  value: DictValue;
};
```

### DictDescription\<A\>

字典描述类型，键为枚举键名，值为枚举元数据。

```typescript
type DictDescription<A extends DictMetaAppend> = Record<DictKey, DictMeta<A>>;
```

### DictExpose\<A, E\>

字典暴露对象类型，包含完整的枚举信息。

```typescript
type DictExpose<A extends DictMetaAppend, E extends DictDescription<A>> = {
  readonly definition: E;
  readonly descriptions: MergeIntersection<A & { key: keyof E; value: E[keyof E]['value'] }>[];
  readonly keys: UnionToTuple<keyof E>;
  readonly length: UnionToTuple<keyof E>['length'];
  readonly values: UnionToTuple<E[keyof E]['value']>;
  readonly kvRecord: Record<keyof E, E[keyof E]['value']>;
  readonly vkRecord: Record<E[keyof E]['value'], keyof E>;
  toKeyRecord: <P extends keyof A>(prop: P) => Record<keyof E, A[P]>;
  toValRecord: <P extends keyof A>(prop: P) => Record<E[keyof E]['value'], A[P]>;
};
```

**属性说明**

| 属性         | 类型       | 描述                               |
| ------------ | ---------- | ---------------------------------- |
| definition   | `E`        | 原始枚举定义对象                   |
| descriptions | `Array`    | 枚举项的完整描述数组               |
| keys         | `Tuple`    | 枚举键名的元组                     |
| length       | `number`   | 枚举项的数量                       |
| values       | `Tuple`    | 枚举值的元组                       |
| kvRecord     | `Record`   | 键到值的映射记录                   |
| vkRecord     | `Record`   | 值到键的映射记录                   |
| toKeyRecord  | `Function` | 根据属性名创建键到属性值的映射记录 |
| toValRecord  | `Function` | 根据属性名创建值到属性值的映射记录 |

## 函数

### declareDict

声明一个枚举工厂函数，提供类型提示。

```typescript
function declareDict<A extends DictMetaAppend>(): {
  define<const E extends DictDescription<A>>(definition: E): DictExpose<A, E>;
};
```

**类型参数**

| 参数 | 描述                                        |
| ---- | ------------------------------------------- |
| `A`  | 枚举元数据附加类型，扩展自 `DictMetaAppend` |

**返回值**

返回包含 `define` 方法的对象，`define` 方法接收枚举定义并返回 `DictExpose` 对象。

**示例**

```typescript
const createStatusDict = declareDict<{ label: string }>();

const Status = createStatusDict.define({
  Pending: { value: 0, label: '待处理' },
  Approved: { value: 1, label: '已批准' },
  Rejected: { value: 2, label: '已拒绝' },
});

Status.Pending; // 0
Status.$Pending; // { key: 'Pending', value: 0, label: '待处理' }
Status.keys; // ['Pending', 'Approved', 'Rejected']
Status.values; // [0, 1, 2]
Status.length; // 3
Status.kvRecord; // { Pending: 0, Approved: 1, Rejected: 2 }
Status.vkRecord; // { 0: 'Pending', 1: 'Approved', 2: 'Rejected' }
Status.descriptions; // [{ key: 'Pending', value: 0, label: '待处理' }, ...]
Status.toKeyRecord('label'); // { Pending: '待处理', Approved: '已批准', Rejected: '已拒绝' }
Status.toValRecord('label'); // { 0: '待处理', 1: '已批准', 2: '已拒绝' }
```
