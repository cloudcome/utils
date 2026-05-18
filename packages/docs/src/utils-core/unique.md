---
outline: deep
---

# unique

唯一 ID 生成工具。

## 导入

```typescript
import { uniqueBigInt, uniqueString } from '@cloudcome/utils-core/unique';
```

## 函数

### uniqueBigInt

生成唯一的大整数 ID。

```typescript
function uniqueBigInt(randomLength?: number): bigint;
```

**参数**

| 参数         | 类型     | 默认值 | 描述           |
| ------------ | -------- | ------ | -------------- |
| randomLength | `number` | `0`    | 随机部分的长度 |

**返回值**

`bigint` - 唯一的大整数 ID

**示例**

```typescript
uniqueBigInt(); // 基于时间戳的唯一值
uniqueBigInt(6); // 带 6 位随机部分

// 同一毫秒内多次调用，通过递增填充保证唯一性
const a = uniqueBigInt();
const b = uniqueBigInt();
a !== b; // true
```

**边界情况**

```typescript
// randomLength 为 0 时不添加随机部分
uniqueBigInt(0); // 仅时间戳 + 填充

// 短时间内连续调用
const ids = Array.from({ length: 100 }, () => uniqueBigInt(4));
new Set(ids).size; // 100，全部唯一
```

### uniqueString

生成唯一的字符串 ID。

```typescript
function uniqueString(minLength?: number | string, dict?: string): string;
```

**参数**

| 参数      | 类型               | 默认值                                                             | 描述                                           |
| --------- | ------------------ | ------------------------------------------------------------------ | ---------------------------------------------- |
| minLength | `number \| string` | -                                                                  | 最小长度，或字符字典（当仅传一个字符串参数时） |
| dict      | `string`           | `'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'` | 字符字典                                       |

**返回值**

`string` - 唯一的字符串 ID

**示例**

```typescript
// 无参数：默认长度 + 默认字典
uniqueString(); // 'a1b2c3d4e5f6'

// 指定最小长度
uniqueString(16); // 'a1b2c3d4e5f6g7h8'（16 字符）

// 指定长度和自定义字典
uniqueString(4, '0123456789'); // '1234'（纯数字）

// 仅传字典（第一个参数为字符串时）
uniqueString('abcdef'); // 使用 abcdef 作为字符集
```

**重载说明**

| 调用方式                         | minLength | dict           |
| -------------------------------- | --------- | -------------- |
| `uniqueString()`                 | 0（默认） | `STRING_DICT`  |
| `uniqueString(16)`               | 16        | `STRING_DICT`  |
| `uniqueString(16, '0123456789')` | 16        | `'0123456789'` |
| `uniqueString('abcdef')`         | 0         | `'abcdef'`     |

**边界情况**

```typescript
// 生成的字符串长度 >= minLength
const s = uniqueString(10);
s.length >= 10; // true

// 使用自定义字符集
uniqueString(8, 'AB'); // 仅包含 A 和 B 的字符串

// 同一毫秒内连续调用仍保证唯一
const a = uniqueString();
const b = uniqueString();
a !== b; // true
```
