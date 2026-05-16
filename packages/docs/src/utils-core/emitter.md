---
outline: deep
---

# emitter

事件发射器，用于管理事件监听和触发。

## 导入

```typescript
import { Emitter, type EmitterMap, type EmitterListener } from '@cloudcome/utils-core/emitter'
```

## 类型定义

### EmitterMap

事件类型映射，key 为事件名称，value 为事件参数类型数组。

```typescript
type EmitterMap = Record<string, unknown[]>
```

### EmitterListener\<E, K\>

事件监听器函数类型。

```typescript
type EmitterListener<E extends EmitterMap, K extends keyof E> = (...payloads: E[K]) => false | unknown
```

## 类

### Emitter\<E\>

事件发射器类。

```typescript
class Emitter<E extends EmitterMap = Record<string | symbol, unknown[]>> {
  on<K extends keyof E>(event: K, listener: EmitterListener<E, K>): void
  once<K extends keyof E>(event: K, listener: EmitterListener<E, K>): void
  off<K extends keyof E>(event?: K, listener?: EmitterListener<E, K>): void
  emit<K extends keyof E>(event: K, ...payloads: Parameters<EmitterListener<E, K>>): void
}
```

**方法**

| 方法                       | 描述                                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `on(event, listener)`      | 注册事件监听器                                                                                              |
| `once(event, listener)`    | 注册事件监听器，仅触发一次后自动移除                                                                        |
| `off(event?, listener?)`   | 移除事件监听器。不传参数移除所有；只传 `event` 移除该事件所有监听器；传 `event` + `listener` 移除特定监听器 |
| `emit(event, ...payloads)` | 触发指定事件。监听器返回 `false` 可阻止后续监听器执行                                                       |

**示例**

```typescript
type MyEvents = {
  click: [x: number, y: number]
  change: [value: string]
}

const emitter = new Emitter<MyEvents>()

const clickHandler = (x: number, y: number) => {
  console.log(`点击位置: (${x}, ${y})`)
}

emitter.on('click', clickHandler)
emitter.emit('click', 10, 20) // 输出: 点击位置: (10, 20)

// 仅触发一次
emitter.once('change', (value) => {
  console.log(`值变为: ${value}`)
})
emitter.emit('change', 'hello') // 输出: 值变为: hello
emitter.emit('change', 'world') // 不输出（已移除）

// 移除特定监听器
emitter.off('click', clickHandler)

// 移除某事件所有监听器
emitter.off('click')

// 移除所有监听器
emitter.off()
```
