---
outline: deep
---

# exception

异常构建工具，用于创建自定义异常类。

## 导入

```typescript
import { defineException, type DefineExceptionOptions } from '@cloudcome/utils-core/exception'
```

## 类型定义

### DefineExceptionOptions

构建异常的配置选项。

```typescript
type DefineExceptionOptions = {
  format?: (name: string, message: string) => string
}
```

**属性说明**

| 属性 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| format | `(name: string, message: string) => string` | `(name, message) => \`[\${name}] \${message}\`` | 自定义错误消息格式函数 |

## 函数

### defineException

自定义异常类。

```typescript
function defineException<T = void>(
  name: string,
  options?: DefineExceptionOptions
): { new (message: string, extra: T): Error & T }
```

**类型参数**

| 参数 | 描述 |
| --- | --- |
| `T` | 额外属性的类型，默认为 `void` |

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| name | `string` | 异常类名称 |
| options | `DefineExceptionOptions` | 可选，构建选项 |

**返回值**

返回一个异常类构造函数，接收 `message` 和 `extra` 参数。

**示例**

```typescript
const MyException = defineException<{ code: number }>('MyException')

const err = new MyException('something went wrong', { code: 404 })
console.log(err.message) // '[MyException] something went wrong'
console.log(err.name) // 'MyException'
console.log(err.code) // 404

// 无额外属性
const SimpleException = defineException('SimpleException')
const err2 = new SimpleException('error', undefined)
console.log(err2.message) // '[SimpleException] error'
```
