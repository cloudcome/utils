---
outline: deep
---

# timer

浏览器定时器工具，基于 requestAnimationFrame。

## 导入

```typescript
import { frameInterval } from '@cloudcome/utils-browser/timer'
```

## 类型定义

继承自 `@cloudcome/utils-core/timer` 的类型：

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

| 属性     | 类型      | 默认值  | 描述                              |
| -------- | --------- | ------- | --------------------------------- |
| leading  | `boolean` | `false` | 是否在启动时立即执行回调          |
| trailing | `boolean` | `false` | 是否在停止/暂停时执行最后一次回调 |

**trailing 行为**

- `timer.stop()` 时，如果 `trailing: true`，会在停止前额外执行一次回调
- `timer.pause()` 时，如果 `trailing: true`，会在暂停前额外执行一次回调

**resume 的 immediate 参数**

- `timer.resume(true)` - 恢复时立即执行一次回调
- `timer.resume()` 或 `timer.resume(false)` - 等待下一帧再恢复执行
- 如果 `leading: true`，则 `resume()` 默认也会立即执行

## 函数

### frameInterval

基于 `requestAnimationFrame` 的间隔定时器，每帧执行一次回调（约 60fps）。

```typescript
function frameInterval(
  callback: (state: TimerState, next?: () => void) => unknown,
  options?: TimerOptions
): TimerHandler
```

**参数**

| 参数     | 类型                                                | 描述                                         |
| -------- | --------------------------------------------------- | -------------------------------------------- |
| callback | `(state: TimerState, next?: () => void) => unknown` | 回调函数，接收定时器状态和可选的 `next` 函数 |
| options  | `TimerOptions`                                      | 可选，配置选项（`leading` / `trailing`）     |

**返回值**

`TimerHandler` - 定时器控制句柄，包含 `start`、`pause`、`resume`、`stop` 方法

**示例**

```typescript
// 基本用法
const timer = frameInterval((state) => {
  console.log('Frame:', state.times)
})

timer.start()

// 3 秒后暂停
setTimeout(() => timer.pause(), 3000)

// 5 秒后恢复
setTimeout(() => timer.resume(), 5000)

// 10 秒后停止
setTimeout(() => timer.stop(), 10000)
```

```typescript
// 使用 options 和 state
const timer = frameInterval(
  (state) => {
    console.log(`第 ${state.times} 帧，已运行 ${state.runningTime}ms`)

    // 运行 5 秒后自动停止
    if (state.runningTime > 5000) {
      timer.stop()
    }
  },
  { leading: true } // 启动时立即执行一次
)

timer.start()
```

```typescript
// 使用 next 控制下一帧
const timer = frameInterval((state, next) => {
  console.log('Processing frame', state.times)

  // 执行 10 帧后停止
  if (state.times < 10) {
    next?.() // 手动触发下一帧
  }
})

timer.start()
```

```typescript
// 暂停/恢复完整示例
const timer = frameInterval((state) => {
  console.log(`运行中... 第 ${state.times} 帧`)
})

// 启动
timer.start()

// 暂停（暂停期间不再执行回调）
timer.pause()

// 恢复（从上一次暂停处继续）
timer.resume()

// 立即恢复（恢复时立即执行一次回调）
timer.resume(true)

// 停止（释放资源）
timer.stop()
```
