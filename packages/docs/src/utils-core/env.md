---
outline: deep
---

# env

环境检测工具，判断当前运行环境。

## 导入

```typescript
import { isBrowser, isNode, isWorker, isMacOS, isLinux, isWindows } from '@cloudcome/utils-core/env'
```

## 函数

### isBrowser

判断当前环境是否为浏览器环境。

```typescript
function isBrowser(): boolean
```

**返回值**

`boolean` - 如果是浏览器环境返回 `true`

**示例**

```typescript
if (isBrowser()) {
  // 浏览器环境特有逻辑
  console.log(window.innerWidth)
}
```

### isNode

判断当前环境是否为 Node.js 环境。

```typescript
function isNode(): boolean
```

**返回值**

`boolean` - 如果是 Node.js 环境返回 `true`

**示例**

```typescript
if (isNode()) {
  // Node.js 环境特有逻辑
  const fs = require('fs')
}
```

### isWorker

判断当前环境是否为 Web Worker 环境。

```typescript
function isWorker(): boolean
```

**返回值**

`boolean` - 如果是 Web Worker 环境返回 `true`

**示例**

```typescript
if (isWorker()) {
  // Worker 环境特有逻辑
  self.postMessage('ready')
}
```

### isMacOS

判断当前操作系统是否为 macOS。

```typescript
function isMacOS(): boolean
```

**返回值**

`boolean` - 如果是 macOS 返回 `true`

**示例**

```typescript
if (isMacOS()) {
  console.log('运行在 macOS 上')
}
```

### isLinux

判断当前操作系统是否为 Linux。

```typescript
function isLinux(): boolean
```

**返回值**

`boolean` - 如果是 Linux 返回 `true`

**示例**

```typescript
if (isLinux()) {
  console.log('运行在 Linux 上')
}
```

### isWindows

判断当前操作系统是否为 Windows。

```typescript
function isWindows(): boolean
```

**返回值**

`boolean` - 如果是 Windows 返回 `true`

**示例**

```typescript
if (isWindows()) {
  console.log('运行在 Windows 上')
}
```

## 组合使用

```typescript
import { isBrowser, isNode, isMacOS, isWindows } from '@cloudcome/utils-core/env'

// 浏览器环境下的平台判断
function getPlatform() {
  if (isBrowser()) {
    if (isMacOS()) return 'browser-macos'
    if (isWindows()) return 'browser-windows'
    return 'browser-other'
  }
  if (isNode()) {
    if (isMacOS()) return 'node-macos'
    if (isWindows()) return 'node-windows'
    return 'node-other'
  }
  return 'unknown'
}

// 跨平台快捷键提示
function getShortcutModifier(): string {
  return isMacOS() ? '⌘' : 'Ctrl'
}
```
