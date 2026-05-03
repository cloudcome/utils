---
outline: deep
---

# version

版本号解析与比较工具。

## 导入

```typescript
import { versionParse, versionCompare, type VersionObject } from '@cloudcome/utils-core/version'
```

## 类型定义

### VersionObject

版本号对象。

```typescript
type VersionObject = {
  major: number
  minor: number
  patch: number
}
```

**属性说明**

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| major | `number` | 主版本号 |
| minor | `number` | 次版本号 |
| patch | `number` | 修订号 |

## 函数

### versionParse

解析语义化版本号字符串为 VersionObject 对象。

```typescript
function versionParse(version: string): VersionObject
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| version | `string` | 版本号字符串，如 `'1.2.3'` |

**返回值**

`VersionObject` - 解析后的版本对象

**示例**

```typescript
versionParse('1.2.3')
// { major: 1, minor: 2, patch: 3 }

versionParse('0.1.0')
// { major: 0, minor: 1, patch: 0 }
```

### versionCompare

比较两个语义化版本号。

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
```
