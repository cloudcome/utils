---
outline: deep
---

# error

错误处理工具。

## 导入

```typescript
import { errorNormalize, errorAssign } from '@cloudcome/utils-core/error'
```

## 函数

### errorNormalize

规范化错误对象，确保返回的是 Error 实例。

```typescript
function errorNormalize<E extends Error | unknown = unknown>(throwError: E): E | Error
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| throwError | `E` | 要规范化的错误，可以是任意值 |

**返回值**

`E | Error` - 规范化后的 Error 实例

**示例**

```typescript
// 传入 Error 实例
const error1 = errorNormalize(new Error('test'))
console.log(error1 instanceof Error) // true

// 传入字符串
const error2 = errorNormalize('something went wrong')
console.log(error2 instanceof Error) // true
console.log(error2.message) // 'something went wrong'

// 传入其他值
const error3 = errorNormalize(42)
console.log(error3 instanceof Error) // true
console.log(error3.message) // '42'
```

### errorAssign

将属性合并到错误对象上。

```typescript
function errorAssign<E extends AnyObject>(error: Error, source: E): Error & E
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| error | `Error` | 目标错误对象 |
| source | `E` | 要合并的属性源 |

**返回值**

`Error & E` - 合并后的错误对象

**示例**

```typescript
const error = new Error('request failed')
const enriched = errorAssign(error, {
  statusCode: 404,
  url: '/api/users'
})

console.log(enriched.message) // 'request failed'
console.log(enriched.statusCode) // 404
console.log(enriched.url) // '/api/users'
```
