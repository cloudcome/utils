---
outline: deep
---

# number

数字工具函数，提供数字格式化、缩写、进制转换等功能。

## 导入

```typescript
import {
  numberFixed,
  randomNumber,
  numberAbbr,
  fileSizeAbbr,
  numberConvert,
  numberFormat,
  numberClamp,
  numberUnit,
  numberDecimals,
  type NumberFixedOptions,
  type NumberAbbrOptions,
  type NumberFormatOptions,
} from '@cloudcome/utils-core/number'
```

## 类型定义

### NumberFixedOptions

数字精确小数位数的配置选项。

```typescript
type NumberFixedOptions = {
  decimals?: number
  round?: 0 | 1 | -1
}
```

**属性说明**

| 属性     | 类型           | 默认值 | 描述                                                |
| -------- | -------------- | ------ | --------------------------------------------------- |
| decimals | `number`       | `0`    | 保留的小数位数                                      |
| round    | `0 \| 1 \| -1` | `0`    | 舍入方法：`0` 四舍五入，`1` 向上取整，`-1` 向下取整 |

### NumberAbbrOptions

数字缩写配置选项。

```typescript
type NumberAbbrOptions = {
  base?: number
  decimals?: number
}
```

**属性说明**

| 属性     | 类型     | 默认值 | 描述                       |
| -------- | -------- | ------ | -------------------------- |
| base     | `number` | `1000` | 进制基数，用于计算单位进阶 |
| decimals | `number` | `0`    | 数值保留的小数位数         |

### NumberFormatOptions

数字格式化配置选项。

```typescript
type NumberFormatOptions = {
  separator?: string
  step?: number
}
```

**属性说明**

| 属性      | 类型     | 默认值 | 描述                           |
| --------- | -------- | ------ | ------------------------------ |
| separator | `string` | `','`  | 分隔符字符                     |
| step      | `number` | `3`    | 分隔步长，每隔多少位添加分隔符 |

## 函数

### numberFixed

对数字进行精确小数位数处理并按规则舍入。

```typescript
function numberFixed(number: number, options?: NumberFixedOptions): number
```

**参数**

| 参数    | 类型                 | 描述               |
| ------- | -------------------- | ------------------ |
| number  | `number`             | 需要处理的原始数值 |
| options | `NumberFixedOptions` | 可选，配置参数     |

**返回值**

`number` - 处理后的数值

**示例**

```typescript
numberFixed(3.1415, { decimals: 2 }) // 3.14（四舍五入）
numberFixed(3.1415, { decimals: 2, round: 1 }) // 3.15（向上取整）
numberFixed(3.9999, { decimals: 1, round: -1 }) // 3.9（向下取整）
```

### randomNumber

生成指定范围内的随机数。

```typescript
function randomNumber(min: number | string, max: number | string): number
```

**参数**

| 参数 | 类型               | 描述                                     |
| ---- | ------------------ | ---------------------------------------- |
| min  | `number \| string` | 随机数的最小值（包含，支持小数、字符串） |
| max  | `number \| string` | 随机数的最大值（包含，支持小数、字符串） |

**返回值**

`number` - 生成的随机数

**示例**

```typescript
randomNumber(1, 10) // 可能返回 7
randomNumber(0.1, 2) // 可能返回 0.7
randomNumber('0.10', 2) // 可能返回 0.75（两位小数）
```

### numberAbbr

将数字转换为带单位缩写的字符串表示。

```typescript
function numberAbbr(number: number, units: Array<string>, options?: NumberAbbrOptions): string
```

**参数**

| 参数    | 类型                | 描述                                                   |
| ------- | ------------------- | ------------------------------------------------------ |
| number  | `number`            | 需要转换的原始数值                                     |
| units   | `Array<string>`     | 单位数组，按从小到大顺序排列（如 `['B', 'KB', 'MB']`） |
| options | `NumberAbbrOptions` | 可选，配置参数                                         |

**返回值**

`string` - 转换后的带单位字符串

**示例**

```typescript
numberAbbr(1500, ['', 'K', 'M'], { base: 1000 }) // '1.5K'
numberAbbr(123456, ['B', 'KB', 'MB'], { decimals: 1 }) // '0.1MB'
numberAbbr(500, ['B', 'KB']) // '500B'
```

### fileSizeAbbr

将文件大小转换为带单位缩写的字符串表示（1024 进制）。

```typescript
function fileSizeAbbr(number: number, decimals?: number): string
```

**参数**

| 参数     | 类型     | 默认值 | 描述                   |
| -------- | -------- | ------ | ---------------------- |
| number   | `number` | -      | 需要转换的文件大小数值 |
| decimals | `number` | `0`    | 数值保留的小数位数     |

**返回值**

`string` - 转换后的带单位字符串

**示例**

```typescript
fileSizeAbbr(1024) // '1KB'
fileSizeAbbr(123456, 1) // '0.1MB'
fileSizeAbbr(1073741824) // '1GB'
```

### numberConvert

将十进制数转换为指定进制的字符串表示。

```typescript
function numberConvert(decimal: number | bigint, dict?: string): string
```

**参数**

| 参数    | 类型               | 描述                                               |
| ------- | ------------------ | -------------------------------------------------- |
| decimal | `number \| bigint` | 需要转换的十进制数                                 |
| dict    | `string`           | 可选，用于表示进制的字符字典，默认为 62 进制字符集 |

**返回值**

`string` - 转换后的指定进制字符串

**示例**

```typescript
numberConvert(123456789) // '8M0kX'（62 进制）
numberConvert(255, '0123456789ABCDEF') // 'FF'（16 进制）
numberConvert(9007199254740991n) // '2gosa7pa2GV'（大整数）
```

### numberFormat

数字格式化，按分隔符和步长分割数字。

```typescript
function numberFormat(number: number | string, options?: NumberFormatOptions | string | number): string
```

**参数**

| 参数    | 类型                                      | 描述                                     |
| ------- | ----------------------------------------- | ---------------------------------------- |
| number  | `number \| string`                        | 要格式化的数字                           |
| options | `NumberFormatOptions \| string \| number` | 可选，格式化配置、分隔符字符串或步长数字 |

**返回值**

`string` - 格式化后的字符串

**示例**

```typescript
numberFormat(123456.789) // '123,456.789'
numberFormat(123456.789, '_') // '123_456.789'
numberFormat(123456.789, 2) // '12,34,56.789'
numberFormat(123456.789, { separator: '.', step: 4 }) // '12.3456.789'
```

### numberClamp

将数字限制在指定范围内。

```typescript
function numberClamp(min: number, number: number, max: number): number
```

**参数**

| 参数   | 类型     | 描述         |
| ------ | -------- | ------------ |
| min    | `number` | 最小值       |
| number | `number` | 要限制的数字 |
| max    | `number` | 最大值       |

**返回值**

`number` - 限制后的数字

**示例**

```typescript
numberClamp(0, 5, 10) // 5
numberClamp(0, -5, 10) // 0
numberClamp(0, 15, 10) // 10
```

### numberUnit

为数字添加单位。

```typescript
function numberUnit(number: string | number, unit?: string): string
```

**参数**

| 参数   | 类型               | 默认值 | 描述           |
| ------ | ------------------ | ------ | -------------- |
| number | `string \| number` | -      | 需要处理的数字 |
| unit   | `string`           | `''`   | 要添加的单位   |

**返回值**

`string` - 带单位的字符串，如果输入不是数字则返回原值

**示例**

```typescript
numberUnit(100, 'px') // '100px'
numberUnit('50', '%') // '50%'
numberUnit('auto', 'px') // 'auto'（非数字原样返回）
```

### numberDecimals

获取数字的小数位数。

```typescript
function numberDecimals(num: number | string): number
```

**参数**

| 参数 | 类型               | 描述                               |
| ---- | ------------------ | ---------------------------------- |
| num  | `number \| string` | 需要计算小数位数的数字或数字字符串 |

**返回值**

`number` - 小数位数，整数返回 `0`

**示例**

```typescript
numberDecimals(3.1415) // 4
numberDecimals('3.1415') // 4
numberDecimals(100) // 0
numberDecimals('1.23e-4') // 6
```
