---
outline: deep
---

# version

版本号解析与比较工具。

## 导入

```typescript
import { versionParse, versionCompare } from '@cloudcome/utils-core/version'
```

## 类型定义

### VersionObject

```typescript
interface VersionObject {
  major: number
  minor: number
  patch: number
  prerelease: string[]
  build: string[]
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| major | `number` | 主版本号 |
| minor | `number` | 次版本号 |
| patch | `number` | 修订号 |
| prerelease | `string[]` | 预发布版本标签 |
| build | `string[]` | 构建元数据 |

## 函数

### versionParse

解析版本号字符串。

```typescript
function versionParse(version: string): VersionObject
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| version | `string` | 版本号字符串，如 `'1.2.3'`、`'1.2.3-beta.1+build.123'` |

**返回值**

`VersionObject` - 解析后的版本对象

**示例**

```typescript
versionParse('1.2.3')
// { major: 1, minor: 2, patch: 3, prerelease: [], build: [] }

versionParse('1.2.3-beta.1')
// { major: 1, minor: 2, patch: 3, prerelease: ['beta', '1'], build: [] }

versionParse('1.2.3+build.123')
// { major: 1, minor: 2, patch: 3, prerelease: [], build: ['build', '123'] }

versionParse('1.2.3-beta.1+build.123')
// { major: 1, minor: 2, patch: 3, prerelease: ['beta', '1'], build: ['build', '123'] }
```

### versionCompare

比较两个版本号。

```typescript
function versionCompare(version1: string, version2: string): number
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| version1 | `string` | 版本号 1 |
| version2 | `string` | 版本号 2 |

**返回值**

`number` - 比较结果：
- `-1`：version1 < version2
- `0`：version1 = version2
- `1`：version1 > version2

**示例**

```typescript
versionCompare('1.0.0', '1.0.0') // 0
versionCompare('1.0.0', '1.0.1') // -1
versionCompare('1.0.1', '1.0.0') // 1
versionCompare('1.0.0', '2.0.0') // -1
versionCompare('2.0.0', '1.0.0') // 1

// 预发布版本
versionCompare('1.0.0-alpha', '1.0.0') // -1
versionCompare('1.0.0', '1.0.0-alpha') // 1
versionCompare('1.0.0-alpha', '1.0.0-beta') // -1
```
