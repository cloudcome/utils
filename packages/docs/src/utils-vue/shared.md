---
outline: deep
---

# shared

共享工具函数。

## 导入

```typescript
import { _runLifeHook, _runScope } from '@cloudcome/utils-vue/shared'
import type { HookListener, HookListenerWithDispose } from '@cloudcome/utils-vue/shared'
```

## 类型定义

### HookListener

```typescript
type HookListener = () => MaybePromise<unknown>
```

### HookListenerWithDispose

```typescript
type HookListenerWithDispose = () => MaybePromise<unknown | HookListener>
```

**说明**

返回清理函数时，`unknown` 类型用于兼容不返回清理函数的情况。

## 函数

### _runLifeHook

运行生命周期钩子。

```typescript
function _runLifeHook<T>(
  enterHook: (hook: AnyFunction) => unknown,
  leaveHook: (hook: AnyFunction) => unknown,
  onEnter: HookListenerWithDispose
): void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| enterHook | `(hook: AnyFunction) => unknown` | 进入时的钩子注册函数 |
| leaveHook | `(hook: AnyFunction) => unknown` | 离开时的钩子注册函数 |
| onEnter | `HookListenerWithDispose` | 进入时的回调，可返回清理函数 |

**返回值**

`void`

**示例**

```typescript
// 基本用法
_runLifeHook(
  (hook) => onMounted(hook),
  (hook) => onUnmounted(hook),
  () => {
    console.log('组件已挂载')
    return () => {
      console.log('组件即将卸载')
    }
  }
)

// 异步回调
_runLifeHook(
  (hook) => onMounted(hook),
  (hook) => onUnmounted(hook),
  async () => {
    await initAsyncResource()
    return () => {
      cleanupResource()
    }
  }
)

// 不返回清理函数（也是合法的）
_runLifeHook(
  (hook) => onMounted(hook),
  (hook) => onUnmounted(hook),
  () => {
    console.log('组件已挂载，无需清理')
  }
)
```

### _runScope

运行作用域函数。

```typescript
function _runScope(runner: HookListenerWithDispose): void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| runner | `HookListenerWithDispose` | 作用域函数，可返回清理函数 |

**返回值**

`void`

**示例**

```typescript
_runScope(() => {
  console.log('作用域开始')
  
  // 返回清理函数
  return () => {
    console.log('作用域结束')
  }
})
```
