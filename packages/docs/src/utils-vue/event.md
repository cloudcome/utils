---
outline: deep
---

# event

事件工具函数。

## 导入

```typescript
import { createEventHook } from '@cloudcome/utils-vue/event'
import type { EventEmitter, CreateEventCenterOptions } from '@cloudcome/utils-vue/event'
```

## 类型定义

### EventEmitter

```typescript
interface EventEmitter {
  on: (event: string, listener: (...payloads: unknown[]) => unknown) => unknown
  off: (event: string, listener: (...payloads: unknown[]) => unknown) => unknown
  emit: (event: string, ...payloads: unknown[]) => unknown
}
```

### CreateEventCenterOptions

```typescript
interface CreateEventCenterOptions {
  emitter?: EventEmitter
  stage?: 'mount' | 'mounted'
}
```

**属性说明**

| 属性    | 类型                   | 默认值      | 描述                                                                                                                              |
| ------- | ---------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| emitter | `EventEmitter`         | -           | 自定义事件发射器。提供时，`on`/`off`/`emit` 会代理到该发射器                                                                      |
| stage   | `'mount' \| 'mounted'` | `'mounted'` | `useEvent` 自动注册事件的生命周期阶段。`'mount'` 在 `onBeforeMount` 注册，`'mounted'` 在 `onMounted` 注册。组件卸载时自动移除监听 |

## 函数

### createEventHook

创建事件钩子。

```typescript
function createEventHook<E extends EmitterMap>(options?: CreateEventCenterOptions): {
  on: <K extends keyof E>(event: K, listener: E[K]) => void
  off: <K extends keyof E>(event: K, listener: E[K]) => void
  emit: <K extends keyof E>(event: K, ...payloads: E[K]) => void
  useEvent: <K extends keyof E>(event: K, listener: E[K]) => void
}
```

**参数**

| 参数    | 类型                       | 描述     |
| ------- | -------------------------- | -------- |
| options | `CreateEventCenterOptions` | 可选配置 |

**返回值**

包含 `on`、`off`、`emit`、`useEvent` 方法的对象

**示例**

```typescript
// 定义事件类型（使用元组声明参数列表）
interface MyEvents {
  message: [text: string]
  error: [error: Error]
}

// 创建事件钩子
const { on, off, emit, useEvent } = createEventHook<MyEvents>()

// 监听事件
on('message', (text) => {
  console.log('收到消息:', text)
})

// 触发事件
emit('message', 'Hello!')

// 取消监听
const handler = (text: string) => {
  console.log(text)
}
on('message', handler)
off('message', handler)

// 在组件中使用（自动清理）
useEvent('message', (text) => {
  console.log('组件中的监听:', text)
})
```

**在组件中使用**

```typescript
import { createEventHook } from '@cloudcome/utils-vue/event'

// 创建全局事件中心（使用元组声明参数列表）
interface MessageEvents {
  message: [text: string]
}
const messageEvent = createEventHook<MessageEvents>()

// 组件 A：发送消息
const sendMessage = () => {
  messageEvent.emit('message', 'Hello from A!')
}

// 组件 B：接收消息
messageEvent.useEvent('message', (text) => {
  console.log('收到消息:', text)
})

// useEvent 自动清理：组件卸载后监听器自动移除
// 以下示例中，组件卸载后再 emit 不会触发已卸载组件的监听器
const wrapper = mount({
  setup() {
    eventCenter.useEvent('test-event', listener)
  }
})
eventCenter.emit('test-event', 'hello', 123)
// listener 被调用 1 次

wrapper.unmount() // 组件卸载，监听器自动移除

eventCenter.emit('test-event', 'world', 456)
// listener 不再被调用（仍为 1 次）

// 使用自定义事件发射器
const customEmitter = {
  on: (event, listener) => /* 自定义注册逻辑 */,
  off: (event, listener) => /* 自定义移除逻辑 */,
  emit: (event, ...payloads) => /* 自定义触发逻辑 */
}
const eventCenter = createEventHook<TestEvents>({ emitter: customEmitter })
// on/off/emit 调用会代理到 customEmitter
```
