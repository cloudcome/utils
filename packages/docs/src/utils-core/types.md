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
  AnyAsyncFunction,
  MaybePromise,
  MaybeCallable,
  DeepPartial,
  PrimitiveValue,
  ReferenceValue,
  KeysOf,
  UnionToIntersection,
  UnionToTuple,
  MergeIntersection,
  LowercaseStartString,
  UppercaseStartString,
  IsEmptyObject,
  IsOnlyProperty,
  HasProperty,
  Exact
} from '@cloudcome/utils-core/types'
```

## 类型定义

### AnyObject

任意对象类型。

```typescript
type AnyObject = Record<PropertyKey, unknown>
```

### AnyArray

任意数组类型。

```typescript
type AnyArray = Array<unknown>
```

### AnyFunction

任意函数类型。

```typescript
type AnyFunction = (...args: any[]) => any
```

### AnyAsyncFunction

任意异步函数类型。

```typescript
type AnyAsyncFunction = (...args: any[]) => Promise<any>
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
type PrimitiveValue = string | number | boolean | bigint | symbol | null | undefined | void | never
```

### ReferenceValue

引用值类型。

```typescript
type ReferenceValue = object
```

### KeysOf\<T\>

获取对象的键类型。

```typescript
type KeysOf<T> = { [P in keyof T]: P extends string ? P : P extends number ? `${P}` : never }[keyof T]
```

### UnionToIntersection\<T\>

将联合类型转换为交叉类型。

```typescript
type UnionToIntersection<T> = (T extends any ? (arg: T) => void : never) extends (arg: infer U) => void ? U : never
```

### UnionToTuple\<T\>

将联合类型转换为元组类型。

```typescript
type UnionToTuple<T> = [T] extends [never] ? [] : [...UnionToTuple<Exclude<T, _UnionLast<T>>>, _UnionLast<T>]
```

**示例**

```typescript
type T3 = UnionToTuple<'a' | 'b' | 'c' | 'd'>
// ['a', 'b', 'c', 'd']
```

### MergeIntersection\<T\>

合并交叉类型。

```typescript
type MergeIntersection<A> = A extends infer T ? { [Key in keyof T]: T[Key] } : never
```

### LowercaseStartString

首字母小写的字符串类型。

```typescript
type LowercaseStartString = `${'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'}${string}`
```

### UppercaseStartString

首字母大写的字符串类型。

```typescript
type UppercaseStartString = `${'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z'}${string}`
```

### IsEmptyObject\<T\>

判断是否为空对象类型。

```typescript
type IsEmptyObject<T> = keyof T extends never ? true : false
```

### IsOnlyProperty\<T, P\>

判断对象是否只有一个属性。

```typescript
type IsOnlyProperty<T, P> = keyof T extends P ? true : false
```

**示例**

```typescript
type Result = IsOnlyProperty<{ a: 1 }, 'a'>
// true

type Result2 = IsOnlyProperty<{ a: 1, b: 2 }, 'a'>
// false
```

### HasProperty\<T, K\>

判断对象是否有指定属性。

```typescript
type HasProperty<T, K> = K extends keyof T ? true : false
```

### Exact\<T, Shape\>

精确类型匹配。

```typescript
type Exact<T, Shape> = T extends Shape ? (Exclude<keyof T, keyof Shape> extends never ? T : never) : never
```
