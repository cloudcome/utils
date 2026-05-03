---
outline: deep
---

# cloud

云函数工具。

## 导入

```typescript
import { parseCloudMethodOutput, parseCloudModuleOutput, respondCloudMethod, createCloudObjectError } from '@cloudcome/utils-uni/cloud'
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
