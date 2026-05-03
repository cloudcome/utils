---
outline: deep
---

# number

数字工具。

## 导入

```typescript
import { numberFormat, numberClamp, numberRandom } from '@cloudcome/utils-core/number'
```

## 函数

### numberFormat

格式化数字。

```typescript
function numberFormat(value: number, options?: NumberFormatOptions): string
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| value | `number` | 要格式化的数字 |
| options | `NumberFormatOptions` | 可选配置 |

**返回值**

`string` - 格式化后的字符串

**示例**

```typescript
numberFormat(1234567) // '1,234,567'
numberFormat(1234567.89, { decimals: 2 }) // '1,234,567.89'
numberFormat(1234, { prefix: '$' }) // '$1,234'
```

### numberClamp

将数字限制在指定范围内。

```typescript
function numberClamp(value: number, min: number, max: number): number
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| value | `number` | 要限制的数字 |
| min | `number` | 最小值 |
| max | `number` | 最大值 |

**返回值**

`number` - 限制后的数字

**示例**

```typescript
numberClamp(5, 0, 10) // 5
numberClamp(-5, 0, 10) // 0
numberClamp(15, 0, 10) // 10
```

### numberRandom

生成随机数。

```typescript
function numberRandom(min: number, max: number): number
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| min | `number` | 最小值 |
| max | `number` | 最大值 |

**返回值**

`number` - 随机数

**示例**

```typescript
numberRandom(0, 100) // 0-100 之间的随机数
numberRandom(1, 10) // 1-10 之间的随机数
```
