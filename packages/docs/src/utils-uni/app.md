---
outline: deep
---

# app

App 相关工具。

## 导入

```typescript
import { useAppShow, uniSubscribeNotice, useAppUpdate } from '@cloudcome/utils-uni/client'
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

### uniSubscribeNotice

订阅 UniApp 模板消息。

```typescript
function uniSubscribeNotice(templateId: string | string[]): Promise<boolean>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| templateId | `string \| string[]` | 模板消息 ID 或 ID 列表 |

**返回值**

`Promise<boolean>` - 用户是否同意订阅

**示例**

```typescript
// 订阅单个模板
const subscribed = await uniSubscribeNotice('template_id_1')
if (subscribed) {
  console.log('用户已同意订阅')
}

// 订阅多个模板
const subscribed = await uniSubscribeNotice(['template_id_1', 'template_id_2'])
```

### useAppUpdate

监听应用更新状态。自动检测新版本，并在更新就绪时提示用户重启应用。

```typescript
function useAppUpdate(): {
  hasUpdate: Ref<boolean>
  updateReady: Ref<boolean>
}
```

**返回值**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| hasUpdate | `Ref<boolean>` | 是否有新版本可用 |
| updateReady | `Ref<boolean>` | 新版本是否已下载就绪 |

**示例**

```typescript
const { hasUpdate, updateReady } = useAppUpdate()

// 监听更新状态
watch(hasUpdate, (val) => {
  if (val) {
    console.log('检测到新版本')
  }
})
```
