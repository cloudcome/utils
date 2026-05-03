---
outline: deep
---

# type

类型判断工具。

## 导入

```typescript
import { 
  typeIs, 
  isString, 
  isNumber, 
  isBoolean, 
  isArray, 
  isObject, 
  isFunction, 
  isNull, 
  isUndefined,
  isNullish,
  isPrimitive,
  isDate,
  isPromise,
  isError
} from '@cloudcome/utils-core/type'
```

## 函数

### typeIs

获取值的类型名称。

```typescript
function typeIs(unknown: unknown): string
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| unknown | `unknown` | 要检查的值 |

**返回值**

`string` - 类型名称，如 `'string'`、`'number'`、`'array'`、`'object'` 等

**示例**

```typescript
typeIs('hello') // 'string'
typeIs(123) // 'number'
typeIs(true) // 'boolean'
typeIs([]) // 'array'
typeIs({}) // 'object'
typeIs(null) // 'null'
typeIs(undefined) // 'undefined'
typeIs(new Date()) // 'date'
typeIs(Promise.resolve()) // 'promise'
typeIs(new Error()) // 'error'
```

### isString

判断是否为字符串。

```typescript
function isString(unknown: unknown): unknown is string
```

**示例**

```typescript
isString('hello') // true
isString(123) // false
isString(null) // false
```

### isNumber

判断是否为数字。

```typescript
function isNumber(unknown: unknown): unknown is number
```

**示例**

```typescript
isNumber(123) // true
isNumber(Infinity) // true
isNumber(NaN) // true
isNumber('123') // false
```

### isBoolean

判断是否为布尔值。

```typescript
function isBoolean(unknown: unknown): unknown is boolean
```

**示例**

```typescript
isBoolean(true) // true
isBoolean(false) // true
isBoolean(0) // false
```

### isArray

判断是否为数组。

```typescript
function isArray(unknown: unknown): unknown is AnyArray
```

**示例**

```typescript
isArray([]) // true
isArray([1, 2, 3]) // true
isArray({}) // false
```

### isObject

判断是否为对象。

```typescript
function isObject(unknown: unknown): unknown is AnyObject
```

**示例**

```typescript
isObject({}) // true
isObject({ a: 1 }) // true
isObject([]) // false
isObject(null) // false
```

### isFunction

判断是否为函数。

```typescript
function isFunction(unknown: unknown): unknown is AnyFunction
```

**示例**

```typescript
isFunction(() => {}) // true
isFunction(function() {}) // true
isFunction(class Foo {}) // true
isFunction({}) // false
```

### isNull

判断是否为 null。

```typescript
function isNull(unknown: unknown): unknown is null
```

**示例**

```typescript
isNull(null) // true
isNull(undefined) // false
isNull(0) // false
```

### isUndefined

判断是否为 undefined。

```typescript
function isUndefined(unknown: unknown): unknown is undefined
```

**示例**

```typescript
isUndefined(undefined) // true
isUndefined(null) // false
isUndefined(0) // false
```

### isNullish

判断是否为 null 或 undefined。

```typescript
function isNullish(unknown: unknown): unknown is null | undefined | void
```

**示例**

```typescript
isNullish(null) // true
isNullish(undefined) // true
isNullish(0) // false
isNullish('') // false
```

### isPrimitive

判断是否为原始值。

```typescript
function isPrimitive(unknown: unknown): unknown is string | number | boolean | symbol | bigint | null | undefined
```

**示例**

```typescript
isPrimitive('hello') // true
isPrimitive(123) // true
isPrimitive(true) // true
isPrimitive(null) // true
isPrimitive({}) // false
isPrimitive([]) // false
```

### isDate

判断是否为 Date 对象。

```typescript
function isDate(unknown: unknown): unknown is Date
```

**示例**

```typescript
isDate(new Date()) // true
isDate('2024-01-01') // false
isDate(1704067200000) // false
```

### isPromise

判断是否为 Promise。

```typescript
function isPromise(unknown: unknown): unknown is Promise<any>
```

**示例**

```typescript
isPromise(Promise.resolve()) // true
isPromise({ then: () => {} }) // false
isPromise({}) // false
```

### isError

判断是否为 Error 对象。

```typescript
function isError(unknown: unknown): unknown is Error
```

**示例**

```typescript
isError(new Error()) // true
isError(new TypeError()) // true
isError({ message: 'error' }) // false
```
