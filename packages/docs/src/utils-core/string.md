---
outline: deep
---

# string

字符串工具函数。

## 导入

```typescript
import { 
  stringCamelCase, 
  stringKebabCase, 
  randomString, 
  stringFormat, 
  randomUUID4, 
  stringify 
} from '@cloudcome/utils-core/string'
```

## 函数

### stringCamelCase

将字符串转换为驼峰命名。

```typescript
function stringCamelCase(string: string, bigger?: boolean): string
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| string | `string` | - | 要转换的字符串 |
| bigger | `boolean` | `false` | 是否首字母大写 |

**返回值**

`string` - 驼峰命名的字符串

**示例**

```typescript
stringCamelCase('hello-world') // 'helloWorld'
stringCamelCase('hello_world') // 'helloWorld'
stringCamelCase('Hello World') // 'helloWorld'
stringCamelCase('hello-world', true) // 'HelloWorld'
stringCamelCase('HELLO_WORLD') // 'helloWorld'
```

### stringKebabCase

将字符串转换为短横线命名。

```typescript
function stringKebabCase(string: string, separator?: string): string
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| string | `string` | - | 要转换的字符串 |
| separator | `string` | `'-'` | 分隔符 |

**返回值**

`string` - 短横线命名的字符串

**示例**

```typescript
stringKebabCase('helloWorld') // 'hello-world'
stringKebabCase('HelloWorld') // 'hello-world'
stringKebabCase('hello_world') // 'hello-world'
stringKebabCase('helloWorld', '_') // 'hello_world'
```

### randomString

生成随机字符串。

```typescript
function randomString(length: number, dict?: string): string
```

**参数**

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| length | `number` | - | 字符串长度 |
| dict | `string` | `'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'` | 字符字典 |

**返回值**

`string` - 随机字符串

**示例**

```typescript
randomString(8) // 'Ab3xYz12'
randomString(4, '0123456789') // '1234'
randomString(16) // 'aBcDeFgHiJkLmNoP'
```

### stringFormat

格式化字符串。

```typescript
// 使用对象格式化
function stringFormat(
  str: string, 
  object: Record<string | number, unknown>, 
  fallback?: string | ((key: string) => string)
): string

// 使用参数格式化
function stringFormat(
  str: string, 
  ...args: (string | number | bigint | undefined | null)[]
): string
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| str | `string` | 模板字符串，使用 `{key}` 或 `{0}` 占位 |
| object | `Record<string \| number, unknown>` | 格式化对象 |
| fallback | `string \| ((key: string) => string)` | 可选，缺失键的回退值 |
| args | `(string \| number \| bigint \| undefined \| null)[]` | 格式化参数 |

**返回值**

`string` - 格式化后的字符串

**示例**

```typescript
// 使用对象
stringFormat('Hello, {name}!', { name: 'World' }) // 'Hello, World!'
stringFormat('{greeting}, {name}!', { greeting: 'Hi', name: 'Alice' }) // 'Hi, Alice!'

// 使用参数
stringFormat('Hello, {0}!', 'World') // 'Hello, World!'
stringFormat('{0} + {1} = {2}', 1, 2, 3) // '1 + 2 = 3'

// 使用回退值
stringFormat('Hello, {name}!', {}, 'Guest') // 'Hello, Guest!'
stringFormat('Hello, {name}!', {}, (key) => `(${key})`) // 'Hello, (name)!'
```

### randomUUID4

生成 UUID v4。

```typescript
function randomUUID4(): string
```

**返回值**

`string` - UUID v4 字符串

**示例**

```typescript
randomUUID4() // '550e8400-e29b-41d4-a716-446655440000'
randomUUID4() // '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
```

### stringify

将值转换为字符串。

```typescript
function stringify(value: unknown): string
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| value | `unknown` | 要转换的值 |

**返回值**

`string` - 字符串表示

**示例**

```typescript
stringify('hello') // 'hello'
stringify(123) // '123'
stringify(true) // 'true'
stringify(null) // 'null'
stringify(undefined) // 'undefined'
stringify({ a: 1 }) // '{"a":1}'
stringify([1, 2, 3]) // '[1,2,3]'
```
