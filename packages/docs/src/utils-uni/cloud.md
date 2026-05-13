---
outline: deep
---

# cloud

云函数工具。

## 导入

```typescript
import { parseCloudMethodOutput, parseCloudModuleOutput, respondCloudMethod, createCloudObjectError, request, buildCloudMethodCreator } from '@cloudcome/utils-uni/cloud'
import type { CloudMethodOutput, CloudModuleOutput, RequestOptions, CloudObjectContext, BuildCloudMethodCreatorOptions, CreateCloudObjectOptions } from '@cloudcome/utils-uni/cloud'
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

### CloudObjectContext

云对象方法执行上下文，包含用户身份信息、权限和配置选项。

```typescript
interface CloudObjectContext {
  /** 用户 ID */
  id: string
  /** 用户角色列表 */
  role: string[]
  /** 用户权限列表 */
  permission: string[]
  /** 是否为管理员 */
  isAdmin: boolean
  /** 云对象创建选项 */
  options: Required<CreateCloudObjectOptions>
}
```

### BuildCloudMethodCreatorOptions

构建云对象方法创建器的配置选项。

```typescript
interface BuildCloudMethodCreatorOptions {
  /** UniId 通用模块，用于处理用户身份验证和权限管理 */
  uniIdCommonModule?: UniIdCommonModule
  /** 需要用户登录态的错误码，默认 'uni-id-check-token-failed' */
  requiredUserErrCode?: number | string
  /** 需要用户登录态的错误消息，默认 '需要登录后才能进行此操作' */
  requiredUserErrMsg?: string
  /** 仅允许本地环境运行的错误消息，默认 '运行环境不匹配' */
  onlyLocalEnvErrMsg?: string
  /** 版本不匹配错误消息，默认 '应用版本过低' */
  appVersionTooLowErrMsg?: string
  /** 应用版本过高错误消息，默认 '应用版本过高' */
  appVersionTooHighErrMsg?: string
  /** 响应附加数据函数，用于在云对象响应中添加额外的上下文信息 */
  respondAppend?: (objectThis: CloudObjectThis) => AnyObject
  /** 所有云对象执行前钩子函数 */
  onBefore?: (context: CloudObjectContext) => MaybePromise<unknown>
}
```

### CreateCloudObjectOptions

云对象方法创建选项。

```typescript
interface CreateCloudObjectOptions {
  /** 是否需要用户登录态，默认 false */
  requiredUser?: boolean
  /** 是否仅在本地环境运行，默认 false */
  onlyLocalEnv?: boolean
  /** 最小支持版本 */
  minVersion?: string
  /** 最大支持版本 */
  maxVersion?: string
  /** 非响应模式，常用于 _before/_after 等钩子函数中 */
  noRespond?: boolean
}
```

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

### buildCloudMethodCreator

构建云对象方法创建器。用于创建云对象方法的工厂函数，支持输入验证、用户身份验证、环境检查等功能。

```typescript
function buildCloudMethodCreator(
  options?: BuildCloudMethodCreatorOptions
): CreateCloudMethod
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| options | `BuildCloudMethodCreatorOptions` | 可选，构建选项 |

**返回值**

`CreateCloudMethod` - 云对象方法创建器

**示例**

```typescript
// 创建云对象方法创建器
const createMethod = buildCloudMethodCreator({
  uniIdCommonModule,
  onBefore: (context) => {
    console.log('执行前:', context.user.id)
  },
})

// 创建无需登录的云方法
export const hello = createMethod(async (context) => {
  return { message: 'Hello World' }
})

// 创建需要登录且带输入验证的云方法
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
})

export const createUser = createMethod(
  userSchema,
  async (context, { name, age }) => {
    return { id: 'user_123', name, age }
  },
  { requiredUser: true }
)
```
