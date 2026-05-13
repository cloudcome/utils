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

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| initialValue | `Ref<T>` | - | 初始值 |
| delay | `number \| Ref<number>` | `100` | 延迟时间（毫秒），默认 100ms |

**返回值**

`ComputedRef<T>` - 延迟更新的计算属性

**示例**

```typescript
const searchQuery = ref('')
const debouncedQuery = useLazyValue(searchQuery, 300)

// 当 searchQuery 改变时，debouncedQuery 会延迟 300ms 更新
watch(debouncedQuery, (query) => {
  // 执行搜索
  search(query)
})
```

### useInterval

创建定时器。

```typescript
function useInterval(callback: () => void, delay?: number | Ref<number>): void
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| callback | `() => void` | - | 回调函数 |
| delay | `number \| Ref<number>` | `0` | 间隔时间（毫秒） |

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
