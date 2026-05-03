---
outline: deep
---

# exception

异常处理工具，用于创建自定义异常类。

## 导入

```typescript
import { buildException } from '@cloudcome/utils-core/exception'
```

## 类型定义

### BuildExceptionOptions

```typescript
interface BuildExceptionOptions {
  // 可选配置
}
```

## 函数

### buildException

创建自定义异常类。

```typescript
function buildException<T = void>(name: string, options?: BuildExceptionOptions): new (data: T) => Error & T
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| name | `string` | 异常类名称 |
| options | `BuildExceptionOptions` | 可选配置 |

**返回值**

`new (data: T) => Error & T` - 自定义异常类构造函数

**示例**

```typescript
// 创建自定义异常
interface NotFoundData {
  resource: string
  id: string
}
const NotFoundError = buildException<NotFoundData>('NotFoundError')

// 使用自定义异常
try {
  throw new NotFoundError({ resource: 'user', id: '123' })
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log(error.message) // 'NotFoundError'
    console.log(error.resource) // 'user'
    console.log(error.id) // '123'
  }
}

// 创建带默认消息的异常
interface ValidationErrorData {
  field: string
  message: string
}
const ValidationError = buildException<ValidationErrorData>('ValidationError')

try {
  throw new ValidationError({ field: 'email', message: 'Invalid email format' })
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.field) // 'email'
    console.log(error.message) // 'Invalid email format'
  }
}
```
