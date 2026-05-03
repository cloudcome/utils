---
outline: deep
---

# date

日期处理工具，包含日期解析、格式化、比较、时区等功能。

## 导入

```typescript
import {
  isValidDate,
  dateParse,
  dateFormat,
  dateRelative,
  isLeapYear,
  isSameDateInYear,
  isSameDateInMonth,
  isSameDateInDay,
  isSameDateInHour,
  isSameDateInMinute,
  isSameDateInSecond,
  dateDaysInMonth,
  dateDaysInYear,
  weeksOfYear,
  weeksOfMonth,
  dateStartInSecond,
  dateStartInMinute,
  dateStartInHour,
  dateStartInDay,
  dateStartInWeek,
  dateStartInMonth,
  dateStartInYear,
  dateEndInSecond,
  dateEndInMinute,
  dateEndInHour,
  dateEndInDay,
  dateEndInWeek,
  dateEndInMonth,
  dateEndInYear,
  TimezoneDate,
  // 类型
  type DateLike,
  type DateValue,
  type DateRelativeTemplate,
  type DateRelativeTemplates,
  type TimezoneDateOptions,
  // 常量
  DATE_SECOND_MS,
  DATE_MINUTE_MS,
  DATE_HOUR_MS,
  DATE_DAY_MS,
  DATE_MONTH_MS,
  DATE_YEAR_MS
} from '@cloudcome/utils-core/date'
```

## 类型定义

### DateLike

```typescript
type DateLike = Date | TimezoneDate
```

### DateValue

```typescript
type DateValue = number | string | DateLike
```

### DateRelativeTemplate

相对时间模板类型。

```typescript
type DateRelativeTemplate = [
  number,    // 时间差阈值（毫秒）
  string,    // 时间差在阈值内的描述模板
  string     // 时间差超过阈值的描述模板
]
```

### DateRelativeTemplates

相对时间模板数组类型。

```typescript
type DateRelativeTemplates = DateRelativeTemplate[]
```

### TimezoneDateOptions

时区日期配置选项。

```typescript
type TimezoneDateOptions = {
  date?: DateValue
  utcOffset?: number
}
```

### EWeekStart

```typescript
enum EWeekStart {
  sunday = 0,
  monday = 1,
  tuesday = 2,
  wednesday = 3,
  thursday = 4,
  friday = 5,
  saturday = 6
}
```

## 常量

| 常量 | 值 | 描述 |
| --- | --- | --- |
| DATE_SECOND_MS | `1000` | 1 秒的毫秒数 |
| DATE_MINUTE_MS | `60 * 1000` | 1 分钟的毫秒数 |
| DATE_HOUR_MS | `60 * 60 * 1000` | 1 小时的毫秒数 |
| DATE_DAY_MS | `24 * 60 * 60 * 1000` | 1 天的毫秒数 |
| DATE_MONTH_MS | `30 * 24 * 60 * 60 * 1000` | 1 月的毫秒数（约） |
| DATE_YEAR_MS | `365 * 24 * 60 * 60 * 1000` | 1 年的毫秒数（约） |

## 函数

### isValidDate

判断是否为有效日期。

```typescript
function isValidDate(unknown: unknown): unknown is Date | TimezoneDate
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| unknown | `unknown` | 要检查的值 |

**返回值**

`unknown is Date | TimezoneDate` - 是否为有效日期

**示例**

```typescript
isValidDate(new Date()) // true
isValidDate(new Date('invalid')) // false
isValidDate('2024-01-01') // false
isValidDate(1704067200000) // false
```

### dateParse

解析日期值。

```typescript
function dateParse(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值，可以是时间戳、日期字符串或 Date 对象 |

**返回值**

`DateLike` - 解析后的日期对象

**示例**

```typescript
dateParse(1704067200000) // Date 对象
dateParse('2024-01-01') // Date 对象
dateParse('2024-01-01T12:00:00Z') // Date 对象
dateParse(new Date()) // Date 对象
```

### dateFormat

格式化日期。

```typescript
function dateFormat(dateValue: DateValue, format?: string): string
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| dateValue | `DateValue` | - | 日期值 |
| format | `string` | `'YYYY-MM-DD HH:mm:ss'` | 格式化模板 |

**格式化占位符**

| 占位符 | 描述 | 示例 |
| --- | --- | --- |
| YYYY | 年份（4 位） | 2024 |
| YY | 年份（2 位） | 24 |
| MM | 月份（2 位） | 01-12 |
| M | 月份 | 1-12 |
| DD | 日期（2 位） | 01-31 |
| D | 日期 | 1-31 |
| HH | 小时（24 小时制，2 位） | 00-23 |
| H | 小时（24 小时制） | 0-23 |
| hh | 小时（12 小时制，2 位） | 01-12 |
| h | 小时（12 小时制） | 1-12 |
| mm | 分钟（2 位） | 00-59 |
| m | 分钟 | 0-59 |
| ss | 秒（2 位） | 00-59 |
| s | 秒 | 0-59 |
| SSS | 毫秒（3 位） | 000-999 |
| A | AM/PM | AM, PM |
| a | am/pm | am, pm |

**返回值**

`string` - 格式化后的日期字符串

**示例**

```typescript
dateFormat(1704067200000) // '2024-01-01 08:00:00'
dateFormat('2024-01-01', 'YYYY/MM/DD') // '2024/01/01'
dateFormat(new Date(), 'YYYY年MM月DD日') // '2024年01月01日'
dateFormat(new Date(), 'HH:mm:ss') // '12:00:00'
dateFormat(new Date(), 'hh:mm:ss A') // '12:00:00 PM'
```

### dateRelative

获取相对时间描述。

```typescript
function dateRelative(dateValue: DateValue, refDateValue?: DateValue, templates?: DateRelativeTemplates): string
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 目标日期 |
| refDateValue | `DateValue` | 参考日期，默认为当前时间 |
| templates | `DateRelativeTemplates` | 自定义模板 |

**返回值**

`string` - 相对时间描述

**示例**

```typescript
const now = new Date()
const past = new Date(now.getTime() - 60 * 1000) // 1 分钟前

dateRelative(past) // '刚刚'
dateRelative(past, now) // '刚刚'

const future = new Date(now.getTime() + 60 * 60 * 1000) // 1 小时后
dateRelative(future) // '1 小时后'
```

### isLeapYear

判断是否为闰年。

```typescript
function isLeapYear(year: number): boolean
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| year | `number` | 年份 |

**返回值**

`boolean` - 是否为闰年

**示例**

```typescript
isLeapYear(2024) // true
isLeapYear(2023) // false
isLeapYear(2000) // true
isLeapYear(1900) // false
```

### isSameDateInYear

判断两个日期是否在同一年。

```typescript
function isSameDateInYear(date1: DateValue, date2: DateValue): boolean
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| date1 | `DateValue` | 第一个日期 |
| date2 | `DateValue` | 第二个日期 |

**返回值**

`boolean` - 是否在同一年

**示例**

```typescript
isSameDateInYear('2024-01-01', '2024-12-31') // true
isSameDateInYear('2024-01-01', '2025-01-01') // false
```

### isSameDateInMonth

判断两个日期是否在同一个月。

```typescript
function isSameDateInMonth(date1: DateValue, date2: DateValue): boolean
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| date1 | `DateValue` | 第一个日期 |
| date2 | `DateValue` | 第二个日期 |

**返回值**

`boolean` - 是否在同一个月

**示例**

```typescript
isSameDateInMonth('2024-01-15', '2024-01-31') // true
isSameDateInMonth('2024-01-15', '2024-02-01') // false
```

### isSameDateInDay

判断两个日期是否在同一天。

```typescript
function isSameDateInDay(date1: DateValue, date2: DateValue): boolean
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| date1 | `DateValue` | 第一个日期 |
| date2 | `DateValue` | 第二个日期 |

**返回值**

`boolean` - 是否在同一天

**示例**

```typescript
isSameDateInDay('2024-01-01 08:00', '2024-01-01 20:00') // true
isSameDateInDay('2024-01-01', '2024-01-02') // false
```

### isSameDateInHour

判断两个日期是否在同一小时。

```typescript
function isSameDateInHour(date1: DateValue, date2: DateValue): boolean
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| date1 | `DateValue` | 第一个日期 |
| date2 | `DateValue` | 第二个日期 |

**返回值**

`boolean` - 是否在同一小时

**示例**

```typescript
isSameDateInHour('2024-01-01 08:30', '2024-01-01 08:45') // true
isSameDateInHour('2024-01-01 08:00', '2024-01-01 09:00') // false
```

### isSameDateInMinute

判断两个日期是否在同一分钟。

```typescript
function isSameDateInMinute(date1: DateValue, date2: DateValue): boolean
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| date1 | `DateValue` | 第一个日期 |
| date2 | `DateValue` | 第二个日期 |

**返回值**

`boolean` - 是否在同一分钟

**示例**

```typescript
isSameDateInMinute('2024-01-01 08:30:15', '2024-01-01 08:30:45') // true
isSameDateInMinute('2024-01-01 08:30:00', '2024-01-01 08:31:00') // false
```

### isSameDateInSecond

判断两个日期是否在同一秒。

```typescript
function isSameDateInSecond(date1: DateValue, date2: DateValue): boolean
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| date1 | `DateValue` | 第一个日期 |
| date2 | `DateValue` | 第二个日期 |

**返回值**

`boolean` - 是否在同一秒

**示例**

```typescript
isSameDateInSecond('2024-01-01 08:30:15.100', '2024-01-01 08:30:15.900') // true
isSameDateInSecond('2024-01-01 08:30:15', '2024-01-01 08:30:16') // false
```

### dateDaysInMonth

获取指定月份的天数。

```typescript
function dateDaysInMonth(dateValue: DateValue): number
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`number` - 天数

**示例**

```typescript
dateDaysInMonth('2024-01') // 31
dateDaysInMonth('2024-02') // 29
dateDaysInMonth('2023-02') // 28
```

### dateDaysInYear

获取指定年份的天数。

```typescript
function dateDaysInYear(dateValue: DateValue): number
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`number` - 天数

**示例**

```typescript
dateDaysInYear('2024') // 366
dateDaysInYear('2023') // 365
```

### weeksOfYear

获取指定日期在当年的周数。

```typescript
function weeksOfYear(dateValue: DateValue, weekStart?: EWeekStart): number
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| dateValue | `DateValue` | - | 日期值 |
| weekStart | `EWeekStart` | `EWeekStart.sunday` | 一周的开始日 |

**返回值**

`number` - 周数

**示例**

```typescript
weeksOfYear('2024-01-01') // 1
weeksOfYear('2024-01-01', EWeekStart.monday) // 1
```

### weeksOfMonth

获取指定日期在当月的周数。

```typescript
function weeksOfMonth(dateValue: DateValue, weekStart?: EWeekStart): number
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| dateValue | `DateValue` | - | 日期值 |
| weekStart | `EWeekStart` | `EWeekStart.sunday` | 一周的开始日 |

**返回值**

`number` - 周数

**示例**

```typescript
weeksOfMonth('2024-01-01') // 1
weeksOfMonth('2024-01-08') // 2
```

### dateStartInSecond

返回秒级起始时间。

```typescript
function dateStartInSecond(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`DateLike` - 秒级起始时间，毫秒部分为 0

**示例**

```typescript
const date = new Date(2023, 5, 15, 12, 30, 45, 500)
dateStartInSecond(date) // 2023-06-15 12:30:45.000
```

### dateStartInMinute

返回分钟级起始时间。

```typescript
function dateStartInMinute(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`DateLike` - 分钟级起始时间，秒和毫秒部分为 0

**示例**

```typescript
const date = new Date(2023, 5, 15, 12, 30, 45, 500)
dateStartInMinute(date) // 2023-06-15 12:30:00.000
```

### dateStartInHour

返回小时级起始时间。

```typescript
function dateStartInHour(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`DateLike` - 小时级起始时间，分钟、秒和毫秒部分为 0

**示例**

```typescript
const date = new Date(2023, 5, 15, 12, 30, 45, 500)
dateStartInHour(date) // 2023-06-15 12:00:00.000
```

### dateStartInDay

返回天级起始时间。

```typescript
function dateStartInDay(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`DateLike` - 天级起始时间，小时、分钟、秒和毫秒部分为 0

**示例**

```typescript
const date = new Date(2023, 5, 15, 12, 30, 45, 500)
dateStartInDay(date) // 2023-06-15 00:00:00.000
```

### dateStartInWeek

返回周级起始时间（周一 00:00:00.000）。

```typescript
function dateStartInWeek(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`DateLike` - 当周周一的起始时间，时间部分为 0

**示例**

```typescript
const date = new Date(2023, 5, 15, 12, 30, 45, 500) // 周四
dateStartInWeek(date) // 2023-06-12 00:00:00.000（周一）
```

### dateStartInMonth

返回月级起始时间。

```typescript
function dateStartInMonth(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`DateLike` - 月级起始时间，日期为当月第一天，时间部分为 0

**示例**

```typescript
const date = new Date(2023, 5, 15, 12, 30, 45, 500)
dateStartInMonth(date) // 2023-06-01 00:00:00.000
```

### dateStartInYear

返回年级起始时间。

```typescript
function dateStartInYear(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`DateLike` - 年级起始时间，月份为 1 月，日期为 1 日，时间部分为 0

**示例**

```typescript
const date = new Date(2023, 5, 15, 12, 30, 45, 500)
dateStartInYear(date) // 2023-01-01 00:00:00.000
```

### dateEndInSecond

返回秒级结束时间。

```typescript
function dateEndInSecond(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`DateLike` - 秒级结束时间，毫秒部分为 999

**示例**

```typescript
const date = new Date(2023, 5, 15, 12, 30, 45, 500)
dateEndInSecond(date) // 2023-06-15 12:30:45.999
```

### dateEndInMinute

返回分钟级结束时间。

```typescript
function dateEndInMinute(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`DateLike` - 分钟级结束时间，秒为 59，毫秒为 999

**示例**

```typescript
const date = new Date(2023, 5, 15, 12, 30, 45, 500)
dateEndInMinute(date) // 2023-06-15 12:30:59.999
```

### dateEndInHour

返回小时级结束时间。

```typescript
function dateEndInHour(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`DateLike` - 小时级结束时间，分钟为 59，秒为 59，毫秒为 999

**示例**

```typescript
const date = new Date(2023, 5, 15, 12, 30, 45, 500)
dateEndInHour(date) // 2023-06-15 12:59:59.999
```

### dateEndInDay

返回天级结束时间。

```typescript
function dateEndInDay(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`DateLike` - 天级结束时间，小时为 23，分钟为 59，秒为 59，毫秒为 999

**示例**

```typescript
const date = new Date(2023, 5, 15, 12, 30, 45, 500)
dateEndInDay(date) // 2023-06-15 23:59:59.999
```

### dateEndInWeek

返回周级结束时间（周日 23:59:59.999）。

```typescript
function dateEndInWeek(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`DateLike` - 当周周日的结束时间，时间为 23:59:59.999

**示例**

```typescript
const date = new Date(2023, 5, 15, 12, 30, 45, 500) // 周四
dateEndInWeek(date) // 2023-06-18 23:59:59.999（周日）
```

### dateEndInMonth

返回月级结束时间。

```typescript
function dateEndInMonth(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`DateLike` - 月级结束时间，日期为当月最后一天，时间为 23:59:59.999

**示例**

```typescript
const date = new Date(2023, 5, 15, 12, 30, 45, 500)
dateEndInMonth(date) // 2023-06-30 23:59:59.999
```

### dateEndInYear

返回年级结束时间。

```typescript
function dateEndInYear(dateValue: DateValue): DateLike
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| dateValue | `DateValue` | 日期值 |

**返回值**

`DateLike` - 年级结束时间，月份为 12 月，日期为 31 日，时间为 23:59:59.999

**示例**

```typescript
const date = new Date(2023, 5, 15, 12, 30, 45, 500)
dateEndInYear(date) // 2023-12-31 23:59:59.999
```

### TimezoneDate

时区日期类，用于处理不同时区的日期。

```typescript
class TimezoneDate {
  constructor(date?: DateValue, utcOffset?: number)

  // 获取方法
  getTimezoneOffset(): number
  getUTCOffset(): number
  getFullYear(): number
  getMonth(): number
  getDate(): number
  getHours(): number
  getMinutes(): number
  getSeconds(): number
  getMilliseconds(): number

  // 设置方法
  setFullYear(year: number, month?: number, date?: number): number
  setMonth(month: number, date?: number): number
  setDate(date: number): number
  setHours(hours: number, minutes?: number, seconds?: number, milliseconds?: number): number
  setMinutes(minutes: number, seconds?: number, milliseconds?: number): number
  setSeconds(seconds: number, milliseconds?: number): number
  setMilliseconds(milliseconds: number): number

  // 转换方法
  toISOString(): string

  // 静态方法
  static changeUtcOffset(td: TimezoneDate, utcOffset: number): TimezoneDate
  static getTimezoneOffset(utcOffset?: number): number
  static getUTCOffset(timezoneOffset?: number): number
}
```

**示例**

```typescript
// 创建时区日期
const td = new TimezoneDate('2024-01-01', 8) // UTC+8

// 获取时间
td.getFullYear() // 2024
td.getMonth() // 0
td.getDate() // 1

// 修改时区
const td2 = TimezoneDate.changeUtcOffset(td, -5) // UTC-5
td2.getHours() // 与 UTC+8 相差 13 小时

// 转换为 ISO 字符串
td.toISOString() // '2024-01-01T00:00:00.000+08:00'
```
