---
outline: deep
---

# app

App 相关工具。

## 导入

```typescript
import { useAppShow } from '@cloudcome/utils-uni/client'
```

## 类型定义

### HookListenerWithDispose

```typescript
type HookListenerWithDispose = () => MaybePromise<undefined | HookListener>
```

## 函数

### useAppShow

监听 App 显示事件（如从后台切到前台）。

```typescript
function useAppShow(appShow: HookListenerWithDispose): void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| appShow | `HookListenerWithDispose` | App 显示时的回调函数，可返回清理函数 |

**返回值**

`void`

**示例**

```typescript
useAppShow(() => {
  console.log('App 显示')
  
  // 返回清理函数
  return () => {
    console.log('App 隐藏')
  }
})
```
