---
outline: deep
---

# easing

贝塞尔曲线缓动函数工具。

## 导入

```typescript
import {
  createEasingFn,
  easingEase,
  easingLinear,
  easingSnap,
  easingIn,
  easingOut,
  easingInOut,
  easingInQuad,
  easingInCubic,
  easingInQuart,
  easingInQuint,
  easingInSine,
  easingInExpo,
  easingInCirc,
  easingInBack,
  easingOutQuad,
  easingOutCubic,
  easingOutQuart,
  easingOutQuint,
  easingOutSine,
  easingOutExpo,
  easingOutCirc,
  easingOutBack,
  easingInOutQuart,
  easingInOutQuint,
  easingInOutSine,
  easingInOutExpo,
  easingInOutCirc,
  easingInOutBack,
} from '@cloudcome/utils-core/easing'
```

## 函数

### createEasingFn

创建一个基于贝塞尔曲线的缓动函数。

```typescript
function createEasingFn(x1: number, y1: number, x2: number, y2: number): (x: number) => number
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| x1 | `number` | 第一个控制点的 X 坐标，范围 `[0, 1]` |
| y1 | `number` | 第一个控制点的 Y 坐标，范围 `[0, 1]` |
| x2 | `number` | 第二个控制点的 X 坐标，范围 `[0, 1]` |
| y2 | `number` | 第二个控制点的 Y 坐标，范围 `[0, 1]` |

**返回值**

`(x: number) => number` - 缓动函数，接受 `0~1` 的进度值，返回缓动后的值

**示例**

```typescript
const myEasing = createEasingFn(0.25, 0.1, 0.25, 1)

myEasing(0)   // 0
myEasing(0.5) // ~0.8
myEasing(1)   // 1
```

## 预设缓动函数

以下预设缓动函数均为 `(x: number) => number` 类型，接受 `0~1` 的进度值。

| 常量 | 描述 |
| --- | --- |
| `easingEase` | 标准缓动 `(0.25, 0.1, 0.25, 1)` |
| `easingLinear` | 线性 `(0, 0, 1, 1)` |
| `easingSnap` | 快速到位 `(0, 1, 0.5, 1)` |
| `easingIn` | 缓入 `(0.42, 0, 1, 1)` |
| `easingOut` | 缓出 `(0, 0, 0.58, 1)` |
| `easingInOut` | 缓入缓出 `(0.42, 0, 0.58, 1)` |
| `easingInQuad` | 二次方缓入 |
| `easingInCubic` | 三次方缓入 |
| `easingInQuart` | 四次方缓入 |
| `easingInQuint` | 五次方缓入 |
| `easingInSine` | 正弦缓入 |
| `easingInExpo` | 指数缓入 |
| `easingInCirc` | 圆形缓入 |
| `easingInBack` | 回退缓入 |
| `easingOutQuad` | 二次方缓出 |
| `easingOutCubic` | 三次方缓出 |
| `easingOutQuart` | 四次方缓出 |
| `easingOutQuint` | 五次方缓出 |
| `easingOutSine` | 正弦缓出 |
| `easingOutExpo` | 指数缓出 |
| `easingOutCirc` | 圆形缓出 |
| `easingOutBack` | 回退缓出 |
| `easingInOutQuart` | 四次方缓入缓出 |
| `easingInOutQuint` | 五次方缓入缓出 |
| `easingInOutSine` | 正弦缓入缓出 |
| `easingInOutExpo` | 指数缓入缓出 |
| `easingInOutCirc` | 圆形缓入缓出 |
| `easingInOutBack` | 回退缓入缓出 |

**示例**

```typescript
import { easingEase, easingInOut } from '@cloudcome/utils-core/easing'

// 动画中使用
function animate(duration: number) {
  const start = Date.now()

  function step() {
    const elapsed = Date.now() - start
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easingEase(progress)

    // 使用 easedProgress 更新动画状态
    element.style.opacity = String(easedProgress)

    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}
```
