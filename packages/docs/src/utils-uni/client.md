---
outline: deep
---

# client

客户端云对象请求工具。

## 导入

```typescript
import { importCloudObject, useCloudMethod, useDatabase } from '@cloudcome/utils-uni/client'
```

## 类型定义

### CloudObjectRequest

```typescript
type CloudObjectRequest<F extends AnyFunction> = (
  ...input: Parameters<F>
) => Promise<CloudMethodOutput<ReturnType<F>>>
```

### UseCloudMethodOptions

```typescript
interface UseCloudMethodOptions<I extends AnyArray, O> extends UseRequestOptions<I, O> {
  onError?: (error: unknown) => unknown
  showLoading?: boolean
  showError?: boolean
}
```

### UseDatabaseOptions

```typescript
interface UseDatabaseOptions<I extends AnyArray, O> extends UseRequestOptions<I, O> {
  _mockDatabase?: any
}
```

## 函数

### importCloudObject

导入云对象。

```typescript
function importCloudObject(
  objectName: string,
  importOptions?: CreateUseCloudObjectOptions
): UseCloudMethod
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| objectName | `string` | 云对象名称 |
| importOptions | `CreateUseCloudObjectOptions` | 可选配置 |

**返回值**

`UseCloudMethod` - 云方法组合式函数

**示例**

```typescript
// 导入云对象
const userApi = importCloudObject('user-api')

// 使用云方法
const { data, loading, error, send } = userApi('getUser', async (request, id: string) => {
  return await request(id)
})

// 发送请求
send('123')
```

### useCloudMethod

创建云方法组合式函数。

```typescript
function useCloudMethod<I extends AnyArray, O>(
  method: string | ((...inputs: I) => string),
  caller: (request: CloudObjectRequest, ...inputs: I) => Promise<CloudMethodOutput<O>>,
  options?: UseCloudMethodOptions<I, O>
): UseRequestOutput<I, O>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| method | `string \| ((...inputs: I) => string)` | 方法名称或返回方法名的函数 |
| caller | `(request: CloudObjectRequest, ...inputs: I) => Promise<CloudMethodOutput<O>>` | 调用函数 |
| options | `UseCloudMethodOptions<I, O>` | 可选配置 |

**返回值**

`UseRequestOutput<I, O>` - 请求状态和方法

**示例**

```typescript
const { data, loading, send } = useCloudMethod(
  'getUser',
  async (request, id: string) => {
    return await request(id)
  },
  {
    showLoading: true,
    showError: true
  }
)

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
| caller | `(db: UniCloud.Database, ...inputs: I) => Promise<ClientDatabaseOutput<O>>` | 数据库查询函数 |
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
