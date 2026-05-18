---
outline: deep
---

# timer

浏览器定时器工具，基于 requestAnimationFrame。

## 导入

```typescript
import { frameInterval, type FrameIntervalOptions } from '@cloudcome/utils-browser/timer';
```

## 类型定义

继承自 `@cloudcome/utils-core/timer` 的类型：

### TimerStateBase

定时器状态基础接口。

```typescript
type TimerStateBase = {
  times: number;
  startAt: number;
  stopAt: number;
  pauseAt: number;
  resumeAt: number;
  currentAt: number;
  elapsedTime: number;
  runningTime: number;
  intervalTime: number;
};
```

### TimerState\<T\>

定时器状态接口，在 `TimerStateBase` 基础上增加 `data` 字段。

```typescript
type TimerState<T = unknown> = TimerStateBase & {
  data: T;
};
```

**泛型参数**

| 参数 | 描述                     | 默认值    |
| ---- | ------------------------ | --------- |
| T    | condition 函数返回值类型 | `unknown` |

### TimerHandler

定时器控制句柄。

```typescript
type TimerHandler = {
  start: () => void;
  pause: () => void;
  resume: (immediate?: boolean) => void;
  stop: () => void;
  execute: () => void;
};
```

### FrameIntervalOptions\<T\>

`frameInterval` 配置选项。

```typescript
type FrameIntervalOptions<T> = {
  condition?: (state: TimerStateBase) => T;
  runner: (state: TimerState<Awaited<T>>) => unknown;
  leading?: boolean;
  trailing?: boolean;
};
```

**属性说明**

| 属性      | 类型                                         | 描述                                               |
| --------- | -------------------------------------------- | -------------------------------------------------- |
| condition | `(state: TimerStateBase) => T`               | 条件函数，每次执行前调用，返回值存入 `state.data`  |
| runner    | `(state: TimerState<Awaited<T>>) => unknown` | 执行函数，每次 requestAnimationFrame 触发时调用    |
| leading   | `boolean`                                    | 是否在定时器启动时立即执行一次，默认 `false`       |
| trailing  | `boolean`                                    | 是否在定时器停止或暂停时额外执行一次，默认 `false` |

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
function frameInterval<T = null>(options: FrameIntervalOptions<T>): TimerHandler;
```

**参数**

| 参数    | 类型                      | 描述     |
| ------- | ------------------------- | -------- |
| options | `FrameIntervalOptions<T>` | 配置选项 |

**返回值**

`TimerHandler` - 定时器控制句柄，包含 `start`、`pause`、`resume`、`stop`、`execute` 方法

**示例**

```typescript
// 基本用法
const timer = frameInterval({
  runner: (state) => {
    console.log('Frame:', state.times);
  },
});

timer.start();

// 3 秒后暂停
setTimeout(() => timer.pause(), 3000);

// 5 秒后恢复
setTimeout(() => timer.resume(), 5000);

// 10 秒后停止
setTimeout(() => timer.stop(), 10000);
```

```typescript
// 使用 options 和 state
const timer = frameInterval({
  runner: (state) => {
    console.log(`第 ${state.times} 帧，已运行 ${state.runningTime}ms`);

    // 运行 5 秒后自动停止
    if (state.runningTime > 5000) {
      timer.stop();
    }
  },
  leading: true, // 启动时立即执行一次
});

timer.start();
```

```typescript
// 使用 condition
const timer = frameInterval({
  condition: (state) => state.times,
  runner: (state) => {
    // state.data 自动推断为 number 类型
    console.log('Current times:', state.data.toFixed(2));
  },
});

timer.start();
```

```typescript
// 暂停/恢复完整示例
const timer = frameInterval({
  runner: (state) => {
    console.log(`运行中... 第 ${state.times} 帧`);
  },
});

// 启动
timer.start();

// 暂停（暂停期间不再执行回调）
timer.pause();

// 恢复（从上一次暂停处继续）
timer.resume();

// 立即恢复（恢复时立即执行一次回调）
timer.resume(true);

// 停止（释放资源）
timer.stop();
```
