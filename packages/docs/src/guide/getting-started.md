---
outline: deep
---

# 快速开始

本指南将帮助您快速上手 `@cloudcome/utils` 工具库。

## 安装

选择您需要的包进行安装：

```bash
# 安装核心工具库
npm install @cloudcome/utils-core

# 安装浏览器端工具
npm install @cloudcome/utils-browser

# 安装 Node.js 端工具
npm install @cloudcome/utils-node

# 安装 Vue 3 工具库
npm install @cloudcome/utils-vue

# 安装 React 工具库
npm install @cloudcome/utils-react

# 安装 UniApp 工具库
npm install @cloudcome/utils-uni
```

或者使用 pnpm：

```bash
pnpm add @cloudcome/utils-core
```

或者使用 yarn：

```bash
yarn add @cloudcome/utils-core
```

## 基本使用

### 核心工具库

```typescript
// 导入核心工具库
import { dateFormat, uniqueString, debounce } from '@cloudcome/utils-core'

// 日期格式化
const now = new Date()
console.log(dateFormat(now, 'YYYY-MM-DD')) // 2024-01-01

// 生成唯一 ID
const id = uniqueString()
console.log(id) // 生成的唯一 ID

// 防抖函数
const debouncedFn = debounce(() => {
  console.log('执行防抖函数')
}, 300)
```

### 浏览器端工具

```typescript
// 导入浏览器端工具
import { cookieGet, cookieSet, downloadURL } from '@cloudcome/utils-browser'

// Cookie 操作
cookieSet('username', 'john', { expires: 7 }) // 设置 Cookie，7 天过期
const username = cookieGet('username') // 获取 Cookie

// 文件下载
downloadURL('https://example.com/file.pdf', 'document.pdf')
```

### Vue 3 工具库

```typescript
// 导入 Vue 3 工具库
import { useRequest, useOnceState } from '@cloudcome/utils-vue'

// 使用请求组合式函数
const { data, loading, error } = useRequest('/api/users')

// 使用一次性状态
const [value, setValue] = useOnceState('default-value')
```

## 按需导入

所有包都支持按需导入，减少打包体积：

```typescript
// 只导入需要的函数
import { dateFormat } from '@cloudcome/utils-core/date'
import { cookieGet } from '@cloudcome/utils-browser/cookie'
import { useRequest } from '@cloudcome/utils-vue/request'
```

## TypeScript 支持

所有包都提供完整的 TypeScript 类型定义：

```typescript
import { dateFormat } from '@cloudcome/utils-core'

// 类型推导
const result: string = dateFormat(new Date(), 'YYYY-MM-DD')

// 类型提示
dateFormat(date, 'YYYY-MM-DD') // 有完整的参数提示
```

## 下一步

- [安装指南](/guide/installation) - 详细的安装说明
- [utils-core](/utils-core/) - 查看核心工具库 API
- [utils-browser](/utils-browser/) - 查看浏览器端工具 API
