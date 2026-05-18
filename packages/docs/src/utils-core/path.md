---
outline: deep
---

# path

路径工具函数。

## 导入

```typescript
import {
  isAbsolutePath,
  isRelativePath,
  pathNormalize,
  pathJoin,
  pathResolve,
  pathRelativize,
  pathDirname,
} from '@cloudcome/utils-core/path';
```

## 函数

### isAbsolutePath

判断是否为绝对路径。

```typescript
function isAbsolutePath(path: string): boolean;
```

**参数**

| 参数 | 类型     | 描述       |
| ---- | -------- | ---------- |
| path | `string` | 路径字符串 |

**返回值**

`boolean` - 是否为绝对路径

**示例**

```typescript
isAbsolutePath('/foo/bar'); // true
isAbsolutePath('foo/bar'); // false
isAbsolutePath('./foo/bar'); // false
```

### isRelativePath

判断是否为相对路径。

```typescript
function isRelativePath(path: string): boolean;
```

**参数**

| 参数 | 类型     | 描述       |
| ---- | -------- | ---------- |
| path | `string` | 路径字符串 |

**返回值**

`boolean` - 是否为相对路径

**示例**

```typescript
isRelativePath('foo/bar'); // true
isRelativePath('./foo/bar'); // true
isRelativePath('../foo/bar'); // true
isRelativePath('/foo/bar'); // false
```

### pathNormalize

规范化路径。

```typescript
function pathNormalize(path: string): string;
```

**参数**

| 参数 | 类型     | 描述       |
| ---- | -------- | ---------- |
| path | `string` | 路径字符串 |

**返回值**

`string` - 规范化后的路径

**示例**

```typescript
pathNormalize('/foo//bar'); // '/foo/bar'
pathNormalize('/foo/./bar'); // '/foo/bar'
pathNormalize('/foo/../bar'); // '/bar'
pathNormalize('foo//bar'); // 'foo/bar'
```

### pathJoin

连接路径。

```typescript
function pathJoin(from: string, ...to: string[]): string;
```

**参数**

| 参数 | 类型       | 描述             |
| ---- | ---------- | ---------------- |
| from | `string`   | 基础路径         |
| to   | `string[]` | 要连接的路径片段 |

**返回值**

`string` - 连接后的路径

**示例**

```typescript
pathJoin('/foo', 'bar'); // '/foo/bar'
pathJoin('/foo', 'bar', 'baz'); // '/foo/bar/baz'
pathJoin('/foo', '../bar'); // '/bar'
pathJoin('/foo', './bar'); // '/foo/bar'
```

### pathResolve

解析路径（从右到左解析，直到解析出绝对路径）。

```typescript
function pathResolve(from: string, ...to: string[]): string;
```

**参数**

| 参数 | 类型       | 描述             |
| ---- | ---------- | ---------------- |
| from | `string`   | 起始路径         |
| to   | `string[]` | 要解析的路径片段 |

**返回值**

`string` - 解析后的绝对路径

**示例**

```typescript
pathResolve('/foo', 'bar'); // '/foo/bar'
pathResolve('/foo', '/bar'); // '/bar'
pathResolve('/foo', '../bar'); // '/bar'
pathResolve('foo', 'bar'); // 当前工作目录 + '/foo/bar'
```

### pathRelativize

将相对路径转换为标准的相对路径格式（添加 `./` 前缀），绝对路径保持不变。

```typescript
function pathRelativize(path: string): string;
```

**参数**

| 参数 | 类型     | 描述       |
| ---- | -------- | ---------- |
| path | `string` | 路径字符串 |

**返回值**

`string` - 处理后的路径

**示例**

```typescript
pathRelativize('/foo/bar'); // '/foo/bar'
pathRelativize('./foo/bar'); // './foo/bar'
pathRelativize('../foo/bar'); // '../foo/bar'
pathRelativize('foo/bar'); // './foo/bar'
```

### pathDirname

获取路径的目录名。

```typescript
function pathDirname(path: string): string;
```

**参数**

| 参数 | 类型     | 描述       |
| ---- | -------- | ---------- |
| path | `string` | 路径字符串 |

**返回值**

`string` - 目录名

**示例**

```typescript
pathDirname('/foo/bar/baz'); // '/foo/bar'
pathDirname('/foo/bar'); // '/foo'
pathDirname('/foo'); // '/'
pathDirname('foo/bar'); // 'foo'
```
