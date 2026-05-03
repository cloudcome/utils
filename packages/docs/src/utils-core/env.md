---
outline: deep
---

# env

环境检测工具。

## 导入

```typescript
import { IS_BROWSER, IS_NODE, IS_TEST } from '@cloudcome/utils-core/env'
```

## 常量

### IS_BROWSER

是否为浏览器环境。

```typescript
const IS_BROWSER: boolean
```

**示例**

```typescript
if (IS_BROWSER) {
  console.log('运行在浏览器中')
}
```

### IS_NODE

是否为 Node.js 环境。

```typescript
const IS_NODE: boolean
```

**示例**

```typescript
if (IS_NODE) {
  console.log('运行在 Node.js 中')
}
```

### IS_TEST

是否为测试环境。

```typescript
const IS_TEST: boolean
```

**示例**

```typescript
if (IS_TEST) {
  console.log('运行在测试环境中')
}
```
