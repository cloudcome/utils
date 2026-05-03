---
outline: deep
---

# page

页面相关工具。

## 导入

```typescript
import { usePageQuery, usePageLoad, usePageShow } from '@cloudcome/utils-uni/page'
```

## 类型定义

### HookListenerWithDispose

```typescript
type HookListenerWithDispose = () => MaybePromise<undefined | HookListener>
```

## 函数

### usePageQuery

获取页面查询参数。

```typescript
function usePageQuery<T extends AnyObject>(onPageLoad?: (query: Reactive<T>) => void): Reactive<T>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| onPageLoad | `(query: Reactive<T>) => void` | 可选，页面加载时的回调 |

**返回值**

`Reactive<T>` - 响应式的查询参数对象

**示例**

```typescript
// 基本用法
const query = usePageQuery<{ id: string; type?: string }>()
console.log(query.id) // '123'
console.log(query.type) // 'list'

// 使用回调
const query = usePageQuery<{ id: string }>((query) => {
  console.log('页面加载，查询参数:', query.id)
  // 可以在这里初始化数据
})
```

### usePageLoad

监听页面加载事件。

```typescript
function usePageLoad(load: HookListenerWithDispose): void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| load | `HookListenerWithDispose` | 页面加载时的回调函数，可返回清理函数 |

**返回值**

`void`

**示例**

```typescript
usePageLoad(() => {
  console.log('页面加载')
  
  // 返回清理函数
  return () => {
    console.log('页面卸载')
  }
})
```

### usePageShow

监听页面显示事件。

```typescript
function usePageShow(pageShow: HookListenerWithDispose): void
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| pageShow | `HookListenerWithDispose` | 页面显示时的回调函数，可返回清理函数 |

**返回值**

`void`

**示例**

```typescript
usePageShow(() => {
  console.log('页面显示')
  
  // 返回清理函数
  return () => {
    console.log('页面隐藏')
  }
})
```
