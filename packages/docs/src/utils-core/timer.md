---
outline: deep
---

# timer

定时器工具，提供可暂停/恢复的间隔定时器。

## 导入

```typescript
import {
  makeInterval,
  timerInterval,
  type TimerStateBase,
  type TimerState,
  type TimerHandler,
  type IntervalHandler,
  type MakeIntervalOptions,
  type TimerIntervalOptions,
} from '@cloudcome/utils-core/timer'
```

## 类型定义

### TimerStateBase

定时器状态基础接口，包含所有时间相关的状态字段。

```typescript
type TimerStateBase = {
  times: number
  startAt: number
  stopAt: number
  pauseAt: number
  resumeAt: number
  currentAt: number
  elapsedTime: number
  runningTime: number
  intervalTime: number
}
```

**属性说明**

| 属性         | 类型     | 描述                           |
| ------------ | -------- | ------------------------------ |
| times        | `number` | 执行次数                       |
| startAt      | `number` | 开始时间戳                     |
| stopAt       | `number` | 停止时间戳                     |
| pauseAt      | `number` | 暂停时间戳                     |
| resumeAt     | `number` | 恢复时间戳                     |
| currentAt    | `number` | 当前时间戳                     |
| elapsedTime  | `number` | 总耗时（包括暂停时间）         |
| runningTime  | `number` | 实际运行时间（不包括暂停时间） |
| intervalTime | `number` | 当前间隔时间                   |

### TimerState\<T\>

定时器状态接口，在 `TimerStateBase` 基础上增加 `data` 字段。

```typescript
type TimerState<T = unknown> = TimerStateBase & {
  data: T
}
```

**泛型参数**

| 参数 | 描述                     | 默认值    |
| ---- | ------------------------ | --------- |
| T    | condition 函数返回值类型 | `unknown` |

**属性说明**

| 属性 | 类型 | 描述                                               |
| ---- | ---- | -------------------------------------------------- |
| data | `T`  | condition 函数返回值，未传入 condition 时为 `null` |

**类型推断行为**

- 未传入 `condition` 时，`T` 推断为 `null`，`state.data` 类型为 `null`
- 传入 `condition` 时，`T` 自动从 condition 返回值推断，`state.data` 类型为对应返回值类型
- condition 支持异步（返回 `Promise<T>`），此时 `state.data` 类型为 `Awaited<T>`

### TimerHandler

定时器控制句柄，提供基本的启停控制方法。

```typescript
type TimerHandler = {
  start: () => void
  pause: () => void
  resume: (immediate?: boolean) => void
  stop: () => void
  execute: () => void
}
```

**方法说明**

| 方法    | 参数                  | 描述                                           |
| ------- | --------------------- | ---------------------------------------------- |
| start   | 无                    | 启动定时器                                     |
| pause   | 无                    | 暂停定时器                                     |
| resume  | `immediate?: boolean` | 恢复定时器，`true` 时立即执行一次              |
| stop    | 无                    | 停止定时器                                     |
| execute | 无                    | 清除上一次定时器，立即执行，并开始下一次定时器 |

### IntervalHandler

间隔定时器控制句柄，继承 `TimerHandler` 并增加状态查询方法。

```typescript
type IntervalHandler = TimerHandler & {
  canStart: () => boolean
  canStop: () => boolean
  canPause: () => boolean
  canResume: () => boolean
}
```

**方法说明**

| 方法      | 返回值  | 描述                            |
| --------- | ------- | ------------------------------- |
| canStart  | boolean | 是否可以启动（处于 READY 状态） |
| canStop   | boolean | 是否可以停止（处于 START 状态） |
| canPause  | boolean | 是否可以暂停（处于 START 状态） |
| canResume | boolean | 是否可以恢复（处于 PAUSE 状态） |

### MakeIntervalOptions\<T\>

`makeInterval` 配置选项。

```typescript
type MakeIntervalOptions<T> = {
  dispatcher: (dispatch: () => void) => unknown
  condition?: (state: TimerStateBase) => T
  runner: (timer: TimerState<NoInfer<Awaited<T>>>) => unknown
  leading?: boolean
  trailing?: boolean
}
```

**属性说明**

| 属性       | 类型                                                  | 描述                                               |
| ---------- | ----------------------------------------------------- | -------------------------------------------------- |
| dispatcher | `(dispatch: () => void) => unknown`                   | 调度器函数，用于安排下一次执行                     |
| condition  | `(state: TimerStateBase) => T`                        | 条件函数，每次执行前调用，返回值存入 `state.data`  |
| runner     | `(timer: TimerState<NoInfer<Awaited<T>>>) => unknown` | 执行函数，每次定时器触发时调用                     |
| leading    | `boolean`                                             | 是否在定时器启动时立即执行一次，默认 `true`        |
| trailing   | `boolean`                                             | 是否在定时器停止或暂停时额外执行一次，默认 `false` |

### TimerIntervalOptions\<T\>

`timerInterval` 配置选项。

```typescript
type TimerIntervalOptions<T> = {
  interval: number
  condition?: (state: TimerStateBase) => T
  runner: (state: TimerState<NoInfer<Awaited<T>>>) => unknown
  leading?: boolean
  trailing?: boolean
}
```

**属性说明**

| 属性      | 类型                                                  | 描述                                               |
| --------- | ----------------------------------------------------- | -------------------------------------------------- |
| interval  | `number`                                              | 间隔时间，单位为毫秒                               |
| condition | `(state: TimerStateBase) => T`                        | 条件函数，每次执行前调用，返回值存入 `state.data`  |
| runner    | `(state: TimerState<NoInfer<Awaited<T>>>) => unknown` | 执行函数，每次定时器触发时调用                     |
| leading   | `boolean`                                             | 是否在定时器启动时立即执行一次，默认 `false`       |
| trailing  | `boolean`                                             | 是否在定时器停止或暂停时额外执行一次，默认 `false` |

## 函数

### makeInterval

创建可控制的间隔定时器核心函数，可自定义调度方式。

```typescript
function makeInterval<T = null>(options: MakeIntervalOptions<T>): IntervalHandler
```

**参数**

| 参数    | 类型                     | 描述     |
| ------- | ------------------------ | -------- |
| options | `MakeIntervalOptions<T>` | 配置选项 |

**返回值**

`IntervalHandler` - 定时器控制方法集合，包含 `canStart`、`canStop`、`canPause`、`canResume` 状态查询方法和 `start`、`stop`、`pause`、`resume`、`execute` 控制方法。

**示例**

```typescript
// 无 condition，state.data 为 null
makeInterval({
  dispatcher: (dispatch) => setTimeout(dispatch, 1000),
  runner: (state) => console.log(state.times),
})

// 有 condition，T 自动推断为 number
makeInterval({
  dispatcher: (dispatch) => setTimeout(dispatch, 1000),
  condition: (state) => state.times,
  runner: (state) => state.data.toFixed(2),
})
```

### timerInterval

创建一个基于 `setTimeout` 的间隔定时器。

```typescript
function timerInterval<T = null>(options: TimerIntervalOptions<T>): TimerHandler
```

**参数**

| 参数    | 类型                      | 描述     |
| ------- | ------------------------- | -------- |
| options | `TimerIntervalOptions<T>` | 配置选项 |

**返回值**

`TimerHandler` - 定时器控制句柄

**示例**

```typescript
// 无 condition
timerInterval({
  interval: 1000,
  runner: (state) => console.log(state.times),
})

// 有 condition，T 自动推断为 number
timerInterval({
  interval: 1000,
  condition: (state) => state.times,
  runner: (state) => state.data.toFixed(2),
})

// 使用 leading 和 trailing 选项
timerInterval({
  interval: 1000,
  leading: true,
  trailing: true,
  runner: (state) => console.log(state.times),
})
```
