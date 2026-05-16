---
outline: deep
---

# timer

定时器工具，提供可暂停/恢复的间隔定时器。

## 导入

```typescript
import {
  makeInterval,
  timeInterval,
  type TimerState,
  type TimerHandler,
  type TimerOptions,
} from '@cloudcome/utils-core/timer'
```

## 类型定义

### TimerState

定时器状态。

```typescript
type TimerState = {
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

### TimerHandler

定时器控制句柄。

```typescript
type TimerHandler = {
  start: () => void
  pause: () => void
  resume: (immediate?: boolean) => void
  stop: () => void
}
```

### TimerOptions

定时器配置选项。

```typescript
type TimerOptions = {
  leading?: boolean
  trailing?: boolean
}
```

**属性说明**

| 属性     | 类型      | 默认值  | 描述                               |
| -------- | --------- | ------- | ---------------------------------- |
| leading  | `boolean` | `false` | 是否在定时器开始时立即执行回调     |
| trailing | `boolean` | `false` | 是否在定时器停止时执行最后一次回调 |

## 函数

### makeInterval

创建间隔定时器核心函数，可自定义调度方式。

```typescript
function makeInterval(
  nextTime: (call: () => void) => void,
  effect: (timer: TimerState, next?: () => void) => unknown,
): {
  canStart: () => boolean
  canStop: () => boolean
  canPause: () => boolean
  canResume: () => boolean
  start: () => void
  stop: () => void
  pause: () => void
  resume: () => void
  execute: () => void
}
```

**参数**

| 参数     | 类型                                                | 描述                                                   |
| -------- | --------------------------------------------------- | ------------------------------------------------------ |
| nextTime | `(call: () => void) => void`                        | 用于安排下一次执行的函数                               |
| effect   | `(timer: TimerState, next?: () => void) => unknown` | 每次执行的回调函数，接收定时器状态和可选的 `next` 函数 |

**返回值**

返回包含控制方法的对象，包括 `canStart`、`canStop`、`canPause`、`canResume` 状态查询方法和 `start`、`stop`、`pause`、`resume`、`execute` 控制方法。

**示例**

```typescript
const interval = makeInterval(
  (call) => setTimeout(call, 1000),
  (state) => {
    console.log(`第 ${state.times} 次执行，已运行 ${state.runningTime}ms`)
  }
)

interval.start()
// 1 秒后: 第 1 次执行，已运行 1000ms
// 2 秒后: 第 2 次执行，已运行 2000ms

interval.pause()  // 暂停
interval.resume() // 恢复
interval.stop()   // 停止
```

### timeInterval

创建一个基于 `setTimeout` 的间隔定时器。

```typescript
function timeInterval(
  callback: (state: TimerState, next?: () => void) => unknown,
  interval: number,
  options?: TimerOptions,
): TimerHandler
```

**参数**

| 参数     | 类型                                                | 描述                   |
| -------- | --------------------------------------------------- | ---------------------- |
| callback | `(state: TimerState, next?: () => void) => unknown` | 每次间隔执行的回调函数 |
| interval | `number`                                            | 间隔时间（毫秒）       |
| options  | `TimerOptions`                                      | 可选，配置选项         |

**返回值**

`TimerHandler` - 定时器控制句柄

**示例**

```typescript
const timer = timeInterval(
  (state) => {
    console.log(`第 ${state.times} 次执行`)
  },
  1000,
  { leading: true }
)

timer.start()  // 立即执行第一次，之后每 1 秒执行
timer.pause()  // 暂停
timer.resume() // 恢复
timer.stop()   // 停止
```
