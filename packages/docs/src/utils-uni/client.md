---
outline: deep
---

# client

客户端工具，提供云对象请求、数据库请求、UI、消息提示、App/页面生命周期等功能。

## 导入

```typescript
import {
  // 云对象
  importCloudObject,
  useDatabase,
  parseCloudMethodOutput,
  type CreateUseCloudObjectOptions,
  type CloudObjectRequest,
  type UseCloudMethodOptions,
  type UseCloudMethod,

  // App
  useAppShow,
  uniSubscribeNotice,
  useAppUpdate,

  // 页面
  usePageQuery,
  usePageLoad,
  usePageShow,

  // 异步
  uniPromise,
  uniCallback,

  // 消息提示
  uniConfirm,
  uniPrompt,
  uniAlert,
  uniToast,
  uniLoading,

  // UI
  querySelectorRects,
  type Rect,

  // 类型
  type UniError,
  type UniFailErr,
  type UniPromiseError,
  type UseDatabaseOptions,
} from '@cloudcome/utils-uni/client'
```

## App 相关

### useAppShow

监听 App 显示事件（如从后台切到前台）。

```typescript
function useAppShow(appShow: HookListenerWithDispose): void
```

**示例**

```typescript
useAppShow(() => {
  console.log('App 显示')

  // 返回清理函数，在 App 隐藏时执行
  return () => {
    console.log('App 隐藏')
  }
})
```

### uniSubscribeNotice

订阅模板消息（微信小程序）。

```typescript
function uniSubscribeNotice(templateId: string | string[]): Promise<boolean>
```

**示例**

```typescript
const subscribed = await uniSubscribeNotice('template_id_xxx')
if (subscribed) {
  console.log('用户已同意订阅')
}
```

### useAppUpdate

监听应用更新状态。

```typescript
function useAppUpdate(): {
  hasUpdate: Ref<boolean>
  updateReady: Ref<boolean>
}
```

**示例**

```typescript
const { hasUpdate, updateReady } = useAppUpdate()

// 有新版本时提示用户
watch(updateReady, (ready) => {
  if (ready) {
    console.log('新版本已准备好')
  }
})
```

## 页面相关

### usePageQuery

获取页面查询参数。

```typescript
function usePageQuery<T extends AnyObject>(
  onPageLoad?: (query: Reactive<T>) => void
): Reactive<T>
```

**示例**

```typescript
// 基本用法
const query = usePageQuery<{ id: string; type?: string }>()
console.log(query.id)

// 使用回调
const query = usePageQuery<{ id: string }>((query) => {
  console.log('页面加载，参数:', query.id)
})
```

### usePageLoad

监听页面加载事件。

```typescript
function usePageLoad(load: HookListenerWithDispose): void
```

**示例**

```typescript
usePageLoad(() => {
  console.log('页面加载')
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

**示例**

```typescript
usePageShow(() => {
  console.log('页面显示')
  return () => {
    console.log('页面隐藏')
  }
})
```

## 异步工具

### uniPromise

包装 uni 异步函数（Promise 形式），处理错误格式。

```typescript
function uniPromise<T>(promise: Promise<T>): Promise<T>
```

**示例**

```typescript
try {
  const result = await uniPromise(uni.getNetworkType())
  console.log(result.networkType)
} catch (error) {
  console.error(error.message)
}
```

### uniCallback

包装 uni 异步函数（回调形式），转换为 Promise。

```typescript
function uniCallback<T>(
  runner: (options: {
    success: (res: T) => void
    fail: (err: UniFailErr) => void
  }) => unknown
): Promise<T>
```

**示例**

```typescript
const result = await uniCallback<UniNamespace.GetLocationSuccess>(
  (options) => uni.getLocation(options)
)
console.log(result.latitude, result.longitude)
```

## 消息提示

### uniConfirm

显示确认弹窗。

```typescript
function uniConfirm(text: string, options?: ShowModalOptions): Promise<boolean>
```

**示例**

```typescript
const confirmed = await uniConfirm('确定要删除吗？')
if (confirmed) {
  // 执行删除
}
```

### uniPrompt

显示输入弹窗。

```typescript
function uniPrompt(text: string, options?: ShowModalOptions): Promise<string>
```

**示例**

```typescript
const input = await uniPrompt('请输入你的昵称')
console.log('输入内容:', input)
```

### uniAlert

显示提示弹窗。

```typescript
function uniAlert(text: string, options?: ShowModalOptions): Promise<void>
```

**示例**

```typescript
await uniAlert('操作成功')
```

### uniToast

显示 Toast 提示，自动在 3 秒后关闭。

```typescript
function uniToast(text: string, icon?: ToastIcon): Promise<void>
function uniToast(text: string, options?: ToastOptions): Promise<void>
```

**示例**

```typescript
// 简单提示
await uniToast('保存成功')

// 自定义图标
await uniToast('加载中', 'loading')

// 自定义选项
await uniToast('网络错误', { icon: 'error', duration: 2000 })
```

### uniLoading

显示加载提示。

```typescript
function uniLoading(title?: string): void
```

**示例**

```typescript
uniLoading('加载中...')
// 记得在完成后关闭
uni.hideLoading()
```

## UI

### querySelectorRects

查询元素距离屏幕的矩形信息。

```typescript
function querySelectorRects(
  instance: ComponentInternalInstance,
  selector: string
): Promise<Rect[]>
```

**示例**

```typescript
const rects = await querySelectorRects(instance, '.item')
rects.forEach((rect) => {
  console.log(rect.left, rect.top, rect.width, rect.height)
})
```

## 云请求

### importCloudObject

导入云对象并创建请求 hook。

```typescript
function importCloudObject<Api extends Record<string, AnyFunction>>(
  objectName: string,
  importOptions?: CreateUseCloudObjectOptions
): UseMethod<Api>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| objectName | `string` | 云对象名称 |
| importOptions | `CreateUseCloudObjectOptions` | 可选配置 |

**返回值**

`UseMethod<Api>` - 用于调用云对象方法的 hook 函数

**示例**

```typescript
type MyApi = {
  getUser: (id: string) => Promise<CloudMethodOutput<{ user: User }>>
  updateUser: (id: string, data: User) => Promise<CloudMethodOutput<{ user: User }>>
}

// 导入云对象，返回 useMethod hook
const useMethod = importCloudObject<MyApi>('my-api')

// 调用云方法
const { data, loading, error, send } = useMethod('getUser', async (request, id: string) => {
  return await request(id)
})

send('123')
```

### useDatabase

创建数据库查询组合式函数。

```typescript
function useDatabase<I extends AnyArray, O>(
  caller: (db: UniCloud.Database, ...inputs: I) => Promise<ClientDatabaseOutput<O>>,
  options?: UseDatabaseOptions<I, O>
): UseRequestOutput<I, O>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| caller | `(db, ...inputs) => Promise<ClientDatabaseOutput<O>>` | 数据库查询函数 |
| options | `UseDatabaseOptions<I, O>` | 可选配置 |

**返回值**

`UseRequestOutput<I, O>` - 请求状态和方法

**示例**

```typescript
const { data, loading, send } = useDatabase(
  async (db, userId: string) => {
    const collection = db.collection('users')
    const result = await collection.doc(userId).get()
    return result.data
  }
)

send('123')
```

### parseCloudMethodOutput

解析云方法输出，自动处理错误。

```typescript
function parseCloudMethodOutput<O>(
  output: CloudMethodOutput<O>,
  fallbackErrorMessage?: string
): O
```

**示例**

```typescript
const output = { errCode: 0, data: { name: 'Alice' } }
const data = parseCloudMethodOutput(output)
console.log(data) // { name: 'Alice' }
```
