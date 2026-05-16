---
outline: deep
---

# time

时间工具函数。

## 导入

```typescript
import { useLazyValue, useInterval } from '@cloudcome/utils-vue/time'
```

## 函数

### useLazyValue

创建延迟更新的计算属性。

```typescript
function useLazyValue<T>(initialValue: Ref<T>, delay?: number | Ref<number>): ComputedRef<T>
```

**参数**

| 参数         | 类型                    | 默认值 | 描述                         |
| ------------ | ----------------------- | ------ | ---------------------------- |
| initialValue | `Ref<T>`                | -      | 初始值                       |
| delay        | `number \| Ref<number>` | `100`  | 延迟时间（毫秒），默认 100ms |

**返回值**

`ComputedRef<T>` - 延迟更新的计算属性

**示例**

```typescript
// 基本用法：默认 100ms 延迟
const searchQuery = ref('')
const debouncedQuery = useLazyValue(searchQuery)

// 当 searchQuery 改变时，debouncedQuery 会延迟 100ms 更新
watch(debouncedQuery, (query) => {
  // 执行搜索
  search(query)
})

// 自定义延迟时间
const debouncedQuery = useLazyValue(searchQuery, 300)

// 响应式延迟
const delay = ref(100)
const lazyValue = useLazyValue(source, delay)

source.value = 'updated'
// lazyValue.value 仍为旧值

delay.value = 200 // 改变延迟时间
// 需要等待新的 200ms 后 lazyValue 才会更新

// 防抖行为：延迟期间多次变化会重新计算延迟
const source = ref(0)
const lazyValue = useLazyValue(source, 100)

source.value = 1
// 50ms 后
source.value = 2
// 再过 50ms（总共 100ms），lazyValue 仍未更新
// 因为 source 在 50ms 时变化，延迟被重置
// 需要再等 100ms（总共 200ms）后 lazyValue 才更新为 2
```

### useInterval

创建定时器。

```typescript
function useInterval(callback: () => void, delay?: number | Ref<number>): void
```

**参数**

| 参数     | 类型                    | 默认值 | 描述             |
| -------- | ----------------------- | ------ | ---------------- |
| callback | `() => void`            | -      | 回调函数         |
| delay    | `number \| Ref<number>` | `0`    | 间隔时间（毫秒） |

**返回值**

`void`

**示例**

```typescript
// 基本用法
useInterval(() => {
  console.log('每秒执行')
}, 1000)

// 使用响应式延迟
const delay = ref(1000)
useInterval(() => {
  console.log('定时执行')
}, delay)

// 改变延迟
delay.value = 2000 // 间隔变为 2 秒
```
