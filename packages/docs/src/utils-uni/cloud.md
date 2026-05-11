---
outline: deep
---

# cloud

云函数工具。

## 导入

```typescript
import { parseCloudMethodOutput, parseCloudModuleOutput, respondCloudMethod, createCloudObjectError, request } from '@cloudcome/utils-uni/cloud'
```

## 类型定义

### CloudMethodOutput\<O\>

```typescript
interface CloudMethodOutput<O> {
  errCode?: number | string
  errMsg?: string
  data?: O
}
```

### CloudModuleOutput\<O\>

```typescript
interface CloudModuleOutput<O> {
  errCode?: number | string
  errMsg?: string
  data?: O
}
```

### RequestOptions

```typescript
interface RequestOptions {
  url: string
  query?: Record<string, string>
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS'
  headers?: Record<string, string>
  data?: AnyObject
  dataType?: string
  contentType?: string
  timeout?: number
}
```

**属性**

| 属性 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| url | `string` | - | 请求 URL 地址 |
| query | `Record<string, string>` | `{}` | URL 查询参数，会自动拼接到 url 后面 |
| method | `'GET' \| 'POST' \| 'PUT' \| 'DELETE' \| 'HEAD' \| 'OPTIONS'` | `'GET'` | HTTP 请求方法 |
| headers | `Record<string, string>` | `{}` | 请求头 |
| data | `AnyObject` | - | 请求体数据 |
| dataType | `string` | `'json'` | 返回数据格式 |
| contentType | `string` | `'json'` | 请求内容类型，`'json'` 为 application/json，`'form'` 为 application/x-www-form-urlencoded |
| timeout | `number` | `10000` | 请求超时时间，单位毫秒 |

## 函数

### parseCloudMethodOutput

解析云方法输出，自动处理错误。

```typescript
function parseCloudMethodOutput<O>(output: CloudMethodOutput<O>, fallbackErrorMessage?: string): O
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| output | `CloudMethodOutput<O>` | - | 云方法输出 |
| fallbackErrorMessage | `string` | `''` | 可选，错误回退消息 |

**返回值**

`O` - 解析后的数据

**示例**

```typescript
const output = {
  errCode: 0,
  data: { name: 'Alice' }
}

const data = parseCloudMethodOutput(output)
console.log(data) // { name: 'Alice' }

// 错误处理
const errorOutput = {
  errCode: 1001,
  errMsg: '用户不存在'
}

try {
  parseCloudMethodOutput(errorOutput)
} catch (error) {
  console.error(error.message) // '用户不存在'
}
```

### parseCloudModuleOutput

解析云模块输出，自动处理错误。

```typescript
function parseCloudModuleOutput<O>(
  output: CloudModuleOutput<O>,
  fallbackErrorMessage?: string
): Omit<O, 'errCode' | 'errMsg'>
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| output | `CloudModuleOutput<O>` | - | 云模块输出 |
| fallbackErrorMessage | `string` | `''` | 可选，错误回退消息 |

**返回值**

`Omit<O, 'errCode' | 'errMsg'>` - 解析后的数据

**示例**

```typescript
const output = {
  errCode: 0,
  data: { name: 'Alice' },
  errCode: undefined,
  errMsg: undefined
}

const data = parseCloudModuleOutput(output)
console.log(data) // { data: { name: 'Alice' } }
```

### respondCloudMethod

响应云方法调用。

```typescript
function respondCloudMethod<O>(
  fn: () => MaybePromise<O>,
  append?: AnyObject
): Promise<CloudMethodOutput<O>>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| fn | `() => MaybePromise<O>` | 云方法实现函数 |
| append | `AnyObject` | 可选，附加到输出的属性 |

**返回值**

`Promise<CloudMethodOutput<O>>` - 云方法输出

**示例**

```typescript
// 云方法实现
export async function getUser(id: string) {
  return respondCloudMethod(async () => {
    const user = await db.collection('users').doc(id).get()
    return user.data
  })
}

// 带附加属性
export async function getUserWithMeta(id: string) {
  return respondCloudMethod(
    async () => {
      const user = await db.collection('users').doc(id).get()
      return user.data
    },
    { timestamp: Date.now() }
  )
}
```

### createCloudObjectError

创建云对象错误。

```typescript
function createCloudObjectError(
  message: string,
  code?: number | string
): Error & { errCode?: number | string; errMsg?: string }
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| message | `string` | 错误消息 |
| code | `number \| string` | 可选，错误代码 |

**返回值**

`Error & { errCode?: number | string; errMsg?: string }` - 错误对象

**示例**

```typescript
throw createCloudObjectError('用户不存在', 1001)
// Error { message: '用户不存在', errCode: 1001, errMsg: '用户不存在' }

throw createCloudObjectError('权限不足', 'PERMISSION_DENIED')
// Error { message: '权限不足', errCode: 'PERMISSION_DENIED', errMsg: '权限不足' }
```

### request

发起 HTTP 请求。基于 `uniCloud.httpclient` 发起请求，支持 GET、POST、PUT、DELETE 等方法。查询参数会自动拼接到 URL 上。

```typescript
function request<T>(options: RequestOptions): Promise<{
  data: T
  status: number
  headers: Record<string, string>
}>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| options | `RequestOptions` | 请求配置选项 |

**返回值**

`Promise<{ data: T; status: number; headers: Record<string, string> }>` - 响应对象

**示例**

```typescript
// GET 请求
const res = await request<{ name: string }>({
  url: 'https://api.example.com/users/1',
})
console.log(res.data) // { name: 'Alice' }
console.log(res.status) // 200

// POST 请求
const res = await request<{ id: string }>({
  url: 'https://api.example.com/users',
  method: 'POST',
  data: { name: 'Alice', age: 25 },
})

// 带查询参数
const res = await request<{ list: any[] }>({
  url: 'https://api.example.com/users',
  query: { page: '1', size: '10' },
})

// 自定义超时和请求头
const res = await request({
  url: 'https://api.example.com/slow-api',
  timeout: 30000,
  headers: { Authorization: 'Bearer token123' },
})
```
