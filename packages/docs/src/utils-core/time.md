---
outline: deep
---

# time

时间单位转换工具。

## 导入

```typescript
import { timeFrom, timeParse, timeToDays, timeToHours, timeToMinutes, timeToSeconds } from '@cloudcome/utils-core/time'
```

## 类型定义

### TimeDuration

```typescript
interface TimeDuration {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| years | `number` | 年 |
| months | `number` | 月 |
| days | `number` | 日 |
| hours | `number` | 时 |
| minutes | `number` | 分 |
| seconds | `number` | 秒 |
| milliseconds | `number` | 毫秒 |

## 函数

### timeFrom

将时间持续时间转换为毫秒数。

```typescript
function timeFrom(duration: string | TimeDuration): number
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| duration | `string \| TimeDuration` | 时间持续时间，可以是字符串（如 `'1h30m'`）或对象 |

**返回值**

`number` - 毫秒数

**示例**

```typescript
// 字符串格式
timeFrom('1h') // 3600000
timeFrom('30m') // 1800000
timeFrom('1h30m') // 5400000
timeFrom('1d') // 86400000
timeFrom('1d12h') // 129600000

// 对象格式
timeFrom({ hours: 1 }) // 3600000
timeFrom({ minutes: 30 }) // 1800000
timeFrom({ hours: 1, minutes: 30 }) // 5400000
timeFrom({ days: 1, hours: 12 }) // 129600000
```

### timeParse

解析时间字符串为 TimeDuration 对象。

```typescript
function timeParse(duration: string): TimeDuration
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| duration | `string` | 时间字符串，如 `'1h30m'`、`'1d12h'` |

**返回值**

`TimeDuration` - 解析后的时间对象

**示例**

```typescript
timeParse('1h') // { years: 0, months: 0, days: 0, hours: 1, minutes: 0, seconds: 0, milliseconds: 0 }
timeParse('30m') // { years: 0, months: 0, days: 0, hours: 0, minutes: 30, seconds: 0, milliseconds: 0 }
timeParse('1h30m') // { years: 0, months: 0, days: 0, hours: 1, minutes: 30, seconds: 0, milliseconds: 0 }
timeParse('1d12h') // { years: 0, months: 0, days: 1, hours: 12, minutes: 0, seconds: 0, milliseconds: 0 }
```

### timeToDays

将毫秒数转换为天数对象。

```typescript
function timeToDays(timeMs: number): TimeDuration
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| timeMs | `number` | 毫秒数 |

**返回值**

`TimeDuration` - 时间对象

**示例**

```typescript
timeToDays(86400000) // { ..., days: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }
timeToDays(172800000) // { ..., days: 2, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }
timeToDays(90000000) // { ..., days: 1, hours: 1, minutes: 0, seconds: 0, milliseconds: 0 }
```

### timeToHours

将毫秒数转换为小时数对象。

```typescript
function timeToHours(timeMs: number): TimeDuration
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| timeMs | `number` | 毫秒数 |

**返回值**

`TimeDuration` - 时间对象

**示例**

```typescript
timeToHours(3600000) // { ..., hours: 1, minutes: 0, seconds: 0, milliseconds: 0 }
timeToHours(7200000) // { ..., hours: 2, minutes: 0, seconds: 0, milliseconds: 0 }
timeToHours(5400000) // { ..., hours: 1, minutes: 30, seconds: 0, milliseconds: 0 }
```

### timeToMinutes

将毫秒数转换为分钟数对象。

```typescript
function timeToMinutes(timeMs: number): TimeDuration
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| timeMs | `number` | 毫秒数 |

**返回值**

`TimeDuration` - 时间对象

**示例**

```typescript
timeToMinutes(60000) // { ..., minutes: 1, seconds: 0, milliseconds: 0 }
timeToMinutes(120000) // { ..., minutes: 2, seconds: 0, milliseconds: 0 }
timeToMinutes(90000) // { ..., minutes: 1, seconds: 30, milliseconds: 0 }
```

### timeToSeconds

将毫秒数转换为秒数对象。

```typescript
function timeToSeconds(timeMs: number): TimeDuration
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| timeMs | `number` | 毫秒数 |

**返回值**

`TimeDuration` - 时间对象

**示例**

```typescript
timeToSeconds(1000) // { ..., seconds: 1, milliseconds: 0 }
timeToSeconds(2000) // { ..., seconds: 2, milliseconds: 0 }
timeToSeconds(1500) // { ..., seconds: 1, milliseconds: 500 }
```
