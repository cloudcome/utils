---
outline: deep
---

# jsonl

JSONL（JSON Lines）读写工具，支持逐行读取和写入 JSONL 文件。

## 导入

```typescript
import { readJsonl, writeJsonl } from '@cloudcome/utils-node/jsonl'
```

## 类型定义

### ReadJsonlOptions\<T\>

```typescript
interface ReadJsonlOptions<T> {
  encoding?: BufferEncoding
  onError?: 'skip' | 'throw' | ((error: Error, line: string, lineNumber: number) => void)
  onLine?: (item: T, lineNumber: number) => void | Promise<void>
}
```

**属性说明**

| 属性 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| encoding | `BufferEncoding` | `'utf8'` | 文件编码 |
| onError | `'skip' \| 'throw' \| ((error: Error, line: string, lineNumber: number) => void)` | `'throw'` | 错误处理策略 |
| onLine | `(item: T, lineNumber: number) => void \| Promise<void>` | - | 逐行回调函数 |

### WriteJsonlOptions

```typescript
interface WriteJsonlOptions {
  encoding?: BufferEncoding
  append?: boolean
}
```

**属性说明**

| 属性 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| encoding | `BufferEncoding` | `'utf8'` | 文件编码 |
| append | `boolean` | `false` | 是否追加模式 |

## 函数

### readJsonl

读取 JSONL 文件。

```typescript
function readJsonl<T = unknown>(filePath: string, options?: ReadJsonlOptions<T>): Promise<T[]>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| filePath | `string` | 文件路径 |
| options | `ReadJsonlOptions<T>` | 可选配置 |

**返回值**

`Promise<T[]>` - 解析后的数据数组

**示例**

```typescript
// 基本用法
const data = await readJsonl('/path/to/data.jsonl')
console.log(data) // [{ name: 'Alice' }, { name: 'Bob' }]

// 指定类型
interface User {
  name: string
  age: number
}
const users = await readJsonl<User>('/path/to/users.jsonl')

// 使用逐行回调
await readJsonl('/path/to/data.jsonl', {
  onLine: (item, lineNumber) => {
    console.log(`Line ${lineNumber}:`, item)
  }
})

// 跳过错误行
await readJsonl('/path/to/data.jsonl', {
  onError: 'skip'
})

// 自定义错误处理
await readJsonl('/path/to/data.jsonl', {
  onError: (error, line, lineNumber) => {
    console.error(`Error at line ${lineNumber}:`, error.message)
  }
})
```

### writeJsonl

写入 JSONL 文件。

```typescript
function writeJsonl<T = unknown>(filePath: string, data: T[], options?: WriteJsonlOptions): Promise<void>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| filePath | `string` | 文件路径 |
| data | `T[]` | 要写入的数据数组 |
| options | `WriteJsonlOptions` | 可选配置 |

**返回值**

`Promise<void>`

**示例**

```typescript
// 基本用法
const data = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 }
]
await writeJsonl('/path/to/data.jsonl', data)

// 追加模式
await writeJsonl('/path/to/data.jsonl', [
  { name: 'Charlie', age: 35 }
], { append: true })

// 指定编码
await writeJsonl('/path/to/data.jsonl', data, { encoding: 'utf-16' })
```
