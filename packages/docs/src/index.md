---
layout: home

hero:
  name: '@cloudcome/utils'
  text: 跨平台、多框架的 TypeScript 工具函数库
  tagline: 覆盖浏览器、Node.js、Vue、React、UniApp 等环境
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: API 参考
      link: /utils-core/

features:
  - icon: 🛠️
    title: 核心工具库
    details: 与运行环境无关的通用工具，包括数组、对象、日期、字符串、加密等
    link: /utils-core/
  - icon: 🌐
    title: 浏览器端工具
    details: DOM、Canvas、Cookie、剪贴板、文件下载等浏览器端功能
    link: /utils-browser/
  - icon: 🖥️
    title: Node.js 端工具
    details: Base64、加密、JSONL 等 Node.js 端功能
    link: /utils-node/
  - icon: 💚
    title: Vue 3 工具库
    details: 组合式函数、组件、请求、状态管理等 Vue 3 功能
    link: /utils-vue/
  - icon: ⚛️
    title: React 工具库
    details: React 相关工具函数
    link: /utils-react/
  - icon: 📱
    title: UniApp 工具库
    details: 云函数、数据库、页面等 UniApp 功能
    link: /utils-uni/
---

## 包列表

| 名称 | 版本 | 描述 |
| --- | --- | --- |
| [@cloudcome/utils-core](./utils-core/) | [![npm version](https://badge.fury.io/js/@cloudcome%2Futils-core.svg)](https://npmjs.com/package/@cloudcome/utils-core) | 核心工具库，与运行环境无关的通用工具 |
| [@cloudcome/utils-browser](./utils-browser/) | [![npm version](https://badge.fury.io/js/@cloudcome%2Futils-browser.svg)](https://npmjs.com/package/@cloudcome/utils-browser) | 浏览器端工具（DOM、Canvas、Cookie、剪贴板等） |
| [@cloudcome/utils-node](./utils-node/) | [![npm version](https://badge.fury.io/js/@cloudcome%2Futils-node.svg)](https://npmjs.com/package/@cloudcome/utils-node) | Node.js 端工具（Base64、加密、JSONL 等） |
| [@cloudcome/utils-vue](./utils-vue/) | [![npm version](https://badge.fury.io/js/@cloudcome%2Futils-vue.svg)](https://npmjs.com/package/@cloudcome/utils-vue) | Vue 3 工具库（组合式函数、组件、请求等） |
| [@cloudcome/utils-react](./utils-react/) | [![npm version](https://badge.fury.io/js/@cloudcome%2Futils-react.svg)](https://npmjs.com/package/@cloudcome/utils-react) | React 工具库 |
| [@cloudcome/utils-uni](./utils-uni/) | [![npm version](https://badge.fury.io/js/@cloudcome%2Futils-uni.svg)](https://npmjs.com/package/@cloudcome/utils-uni) | UniApp 工具库（云函数、数据库、页面等） |

## 快速开始

```bash
# 安装核心工具库
npm install @cloudcome/utils-core

# 或者使用 pnpm
pnpm add @cloudcome/utils-core

# 或者使用 yarn
yarn add @cloudcome/utils-core
```

## 使用示例

```typescript
// 导入核心工具库
import { dateFormat, uniqueString } from '@cloudcome/utils-core'

// 使用日期格式化
const now = new Date()
console.log(dateFormat(now, 'YYYY-MM-DD')) // 2024-01-01

// 生成唯一 ID
const id = uniqueString()
console.log(id) // 生成的唯一 ID
```

## 许可

[MIT](https://github.com/cloudcome/utils/blob/main/LICENSE)
