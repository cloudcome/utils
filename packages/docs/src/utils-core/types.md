---
outline: deep
---

# types

公共类型定义。

## 导入

```typescript
import type { 
  AnyObject, 
  AnyArray, 
  AnyFunction, 
  MaybePromise, 
  DeepPartial 
} from '@cloudcome/utils-core/types'
```

## 类型定义

### AnyObject

任意对象类型。

```typescript
type AnyObject = Record<string, unknown>
```

### AnyArray

任意数组类型。

```typescript
type AnyArray = unknown[]
```

### AnyFunction

任意函数类型。

```typescript
type AnyFunction = (...args: unknown[]) => unknown
```

### AnyAsyncFunction

任意异步函数类型。

```typescript
type AnyAsyncFunction = (...args: unknown[]) => Promise<unknown>
```

### MaybePromise\<T\>

可能为 Promise 的类型。

```typescript
type MaybePromise<T> = T | Promise<T>
```

**示例**

```typescript
function fetchData(): MaybePromise<string> {
  if (useCache) {
    return 'cached data' // 同步返回
  }
  return fetch('/api/data').then(res => res.text()) // 异步返回
}
```

### MaybeCallable\<T\>

可能为函数的类型。

```typescript
type MaybeCallable<T> = T | (() => T)
```

**示例**

```typescript
function getValue(value: MaybeCallable<string>): string {
  return typeof value === 'function' ? value() : value
}

getValue('hello') // 'hello'
getValue(() => 'hello') // 'hello'
```

### DeepPartial\<T\>

深度可选类型。

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
```

**示例**

```typescript
interface Config {
  database: {
    host: string
    port: number
  }
  cache: {
    ttl: number
  }
}

// 所有属性都是可选的
const config: DeepPartial<Config> = {
  database: {
    host: 'localhost'
    // port 可选
  }
  // cache 可选
}
```

### PrimitiveValue

原始值类型。

```typescript
type PrimitiveValue = string | number | boolean | symbol | bigint | null | undefined
```

### ReferenceValue

引用值类型。

```typescript
type ReferenceValue = object
```

### KeysOf\<T\>

获取对象的键类型。

```typescript
type KeysOf<T> = T extends object ? keyof T : never
```

### UnionToIntersection\<T\>

将联合类型转换为交叉类型。

```typescript
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never
```

### MergeIntersection\<T\>

合并交叉类型。

```typescript
type MergeIntersection<T> = T extends object ? { [K in keyof T]: T[K] } : T
```

### LowercaseStartString

首字母小写的字符串类型。

```typescript
type LowercaseStartString = `${Lowercase<string>}${string}`
```

### UppercaseStartString

首字母大写的字符串类型。

```typescript
type UppercaseStartString = `${Uppercase<string>}${string}`
```

### IsEmptyObject\<T\>

判断是否为空对象类型。

```typescript
type IsEmptyObject<T> = T extends Record<string, never> ? true : false
```

### HasProperty\<T, K\>

判断对象是否有指定属性。

```typescript
type HasProperty<T, K extends string> = K extends keyof T ? true : false
```

### Exact\<T, Shape\>

精确类型匹配。

```typescript
type Exact<T, Shape> = T extends Shape ? (Shape extends T ? T : never) : never
```
