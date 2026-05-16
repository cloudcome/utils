---
outline: deep
---

# component

组件工具函数。

## 导入

```typescript
import { useExpose, useEmit, useMethod, useMount, useMounted, useActivated } from '@cloudcome/utils-vue/component'
import type { HookListener, HookListenerWithDispose } from '@cloudcome/utils-vue/component'
```

## 类型定义

### HookListener

```typescript
type HookListener = () => MaybePromise<unknown>
```

### HookListenerWithDispose

```typescript
type HookListenerWithDispose = () => MaybePromise<undefined | HookListener>
```

## 函数

### useExpose

暴露组件实例方法。

```typescript
function useExpose<T>(Comp: T): Ref<ComponentExposed<T> | null>
```

**参数**

| 参数 | 类型 | 描述         |
| ---- | ---- | ------------ |
| Comp | `T`  | 组件实例引用 |

**返回值**

`Ref<ComponentExposed<T> | null>` - 组件实例引用

**示例**

```typescript
// 子组件
const childRef = ref()

// 父组件
const child = useExpose(childRef)

// 初始值为 null
console.log(child.value) // null

// 手动赋值后使用
child.value = { someMethod: () => 'mocked' }
child.value?.someMethod() // 'mocked'
```

### useEmit

监听组件事件。

```typescript
function useEmit<T, E extends PickEmits<Required<ComponentProps<T>>>, K extends keyof E>(
  Comp: T,
  event: K,
  listener: E[K]
): E[K]
```

**参数**

| 参数     | 类型   | 描述         |
| -------- | ------ | ------------ |
| Comp     | `T`    | 组件实例引用 |
| event    | `K`    | 事件名称     |
| listener | `E[K]` | 事件监听函数 |

**返回值**

`E[K]` - 传入的监听函数

**示例**

```typescript
const childRef = ref()

useEmit(childRef, 'update', (value: string) => {
  console.log('收到更新事件:', value)
})
```

### useMethod

调用组件方法。

```typescript
function useMethod<T, M extends PickMethods<Required<ComponentProps<T>>>, K extends keyof M>(
  Comp: T,
  name: K,
  method: M[K]
): M[K]
```

**参数**

| 参数   | 类型   | 描述         |
| ------ | ------ | ------------ |
| Comp   | `T`    | 组件实例引用 |
| name   | `K`    | 方法名称     |
| method | `M[K]` | 方法实现     |

**返回值**

`M[K]` - 传入的方法

**示例**

```typescript
const childRef = ref()

useMethod(childRef, 'validate', () => {
  // 验证逻辑
  return true
})
```

### useMount

在组件挂载前执行。

```typescript
function useMount(beforeMount: HookListenerWithDispose): void
```

**参数**

| 参数        | 类型                      | 描述                       |
| ----------- | ------------------------- | -------------------------- |
| beforeMount | `HookListenerWithDispose` | 挂载前回调，可返回清理函数 |

**示例**

```typescript
// 同步清理
useMount(() => {
  console.log('组件即将挂载')

  // 返回清理函数
  return () => {
    console.log('组件即将卸载')
  }
})

// 异步回调
useMount(async () => {
  await initSomeAsyncResource()

  // 返回清理函数
  return () => {
    cleanupResource()
  }
})
```

### useMounted

在组件挂载后执行。

```typescript
function useMounted(mounted: HookListenerWithDispose): void
```

**参数**

| 参数    | 类型                      | 描述                       |
| ------- | ------------------------- | -------------------------- |
| mounted | `HookListenerWithDispose` | 挂载后回调，可返回清理函数 |

**示例**

```typescript
// 同步清理
useMounted(() => {
  console.log('组件已挂载')

  // 返回清理函数
  return () => {
    console.log('组件即将卸载')
  }
})

// 异步回调
useMounted(async () => {
  const data = await fetchInitialData()

  // 返回清理函数
  return () => {
    data.cleanup()
  }
})
```

### useActivated

在组件激活时执行（keep-alive）。

```typescript
function useActivated(activated: HookListenerWithDispose): void
```

**参数**

| 参数      | 类型                      | 描述                       |
| --------- | ------------------------- | -------------------------- |
| activated | `HookListenerWithDispose` | 激活时回调，可返回清理函数 |

**示例**

```typescript
useActivated(() => {
  console.log('组件已激活')

  // 返回清理函数
  return () => {
    console.log('组件即将停用')
  }
})
```
