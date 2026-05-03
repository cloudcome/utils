---
outline: deep
---

# timer

浏览器定时器工具。

## 导入

```typescript
import { frameInterval } from '@cloudcome/utils-browser/timer'
```

## 类型定义

继承自 `@cloudcome/utils-core/timer` 的类型：

- `TimerHandler`
- `TimerOptions`
- `TimerState`

## 函数

### frameInterval

基于 requestAnimationFrame 的间隔定时器。

```typescript
function frameInterval(
  callback: (state: TimerState, next?: () => void) => unknown,
  options?: TimerOptions
): TimerHandler
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| callback | `(state: TimerState, next?: () => void) => unknown` | 回调函数 |
| options | `TimerOptions` | 可选配置 |

**返回值**

`TimerHandler` - 定时器控制器

**示例**

```typescript
// 基本用法
const timer = frameInterval((state) => {
  console.log('Frame:', state.times)
})

// 停止定时器
timer.stop()

// 恢复定时器
timer.start()

// 使用 next 控制下一帧
const timer2 = frameInterval((state, next) => {
  // 执行某些操作
  console.log('Processing...')
  
  // 手动触发下一帧
  if (state.times < 10) {
    next?.()
  }
})
```
