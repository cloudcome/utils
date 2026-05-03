---
outline: deep
---

# unique

唯一 ID 生成工具。

## 导入

```typescript
import { uniqueBigInt, uniqueString } from '@cloudcome/utils-core/unique'
```

## 函数

### uniqueBigInt

生成唯一的大整数 ID。

```typescript
function uniqueBigInt(randomLength?: number): bigint
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| randomLength | `number` | `4` | 随机部分的长度 |

**返回值**

`bigint` - 唯一的大整数 ID

**示例**

```typescript
uniqueBigInt() // 123456789012345678901234n
uniqueBigInt(6) // 12345678901234567890123456n
```

### uniqueString

生成唯一的字符串 ID。

```typescript
function uniqueString(minLength?: number | string, dict?: string): string
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| minLength | `number \| string` | `8` | 最小长度 |
| dict | `string` | `'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'` | 字符字典 |

**返回值**

`string` - 唯一的字符串 ID

**示例**

```typescript
uniqueString() // 'a1b2c3d4'
uniqueString(16) // 'a1b2c3d4e5f6g7h8'
uniqueString(4, '0123456789') // '1234'
```
