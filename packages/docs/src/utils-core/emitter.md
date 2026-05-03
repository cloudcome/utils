---
outline: deep
---

# emitter

事件发射器，提供发布/订阅模式。

## 导入

```typescript
import { Emitter } from '@cloudcome/utils-core/emitter'
```

## 类型定义

### EmitterMap

```typescript
interface EmitterMap {
  [event: string]: unknown[]
}
```

### EmitterListener\<E, K\>

```typescript
type EmitterListener<E extends EmitterMap, K extends keyof E> = (...payloads: E[K]) => unknown
```

## 类

### Emitter\<E\>

事件发射器类。

```typescript
class Emitter<E extends EmitterMap = Record<string | symbol, unknown[]>> {
  on<K extends keyof E>(event: K, listener: EmitterListener<E, K>): void
  once<K extends keyof E>(event: K, listener: EmitterListener<E, K>): void
  off<K extends keyof E>(event?: K, listener?: EmitterListener<E, K>): void
  offEvent<K extends keyof E>(event: K): void
  offListener<K extends keyof E>(event: K, listener: EmitterListener<E, K>): void
  emit<K extends keyof E>(event: K, ...payloads: Parameters<EmitterListener<E, K>>): void
}
```

**方法**

#### on

监听事件。

```typescript
on<K extends keyof E>(event: K, listener: EmitterListener<E, K>): void
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| event | `K` | 事件名称 |
| listener | `EmitterListener<E, K>` | 事件处理函数 |

#### once

监听事件（只触发一次）。

```typescript
once<K extends keyof E>(event: K, listener: EmitterListener<E, K>): void
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| event | `K` | 事件名称 |
| listener | `EmitterListener<E, K>` | 事件处理函数 |

#### off

取消监听事件。

```typescript
off<K extends keyof E>(event?: K, listener?: EmitterListener<E, K>): void
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| event | `K` | 可选，事件名称。不传则取消所有事件监听 |
| listener | `EmitterListener<E, K>` | 可选，事件处理函数。不传则取消该事件的所有监听 |

#### offEvent

取消指定事件的所有监听。

```typescript
offEvent<K extends keyof E>(event: K): void
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| event | `K` | 事件名称 |

#### offListener

取消指定事件的指定监听。

```typescript
offListener<K extends keyof E>(event: K, listener: EmitterListener<E, K>): void
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| event | `K` | 事件名称 |
| listener | `EmitterListener<E, K>` | 事件处理函数 |

#### emit

触发事件。

```typescript
emit<K extends keyof E>(event: K, ...payloads: Parameters<EmitterListener<E, K>>): void
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| event | `K` | 事件名称 |
| payloads | `Parameters<EmitterListener<E, K>>` | 事件参数 |

**示例**

```typescript
// 定义事件类型
interface MyEvents {
  message: [string, number]
  error: [Error]
  close: []
}

// 创建发射器
const emitter = new Emitter<MyEvents>()

// 监听事件
emitter.on('message', (text, count) => {
  console.log(text, count)
})

// 监听事件（只触发一次）
emitter.once('error', (error) => {
  console.error(error)
})

// 触发事件
emitter.emit('message', 'hello', 42)
emitter.emit('error', new Error('something went wrong'))

// 取消监听
const handler = (text: string, count: number) => {
  console.log(text, count)
}
emitter.on('message', handler)
emitter.off('message', handler)

// 取消指定事件的所有监听
emitter.offEvent('message')

// 取消所有事件监听
emitter.off()
```
