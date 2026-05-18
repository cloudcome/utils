---
outline: deep
---

# 安装指南

本指南提供详细的安装说明和配置选项。

## 系统要求

- Node.js >= 22
- npm >= 9 或 pnpm >= 8 或 yarn >= 1.22

## 安装方式

### npm

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

### pnpm

```bash
# 安装核心工具库
pnpm add @cloudcome/utils-core

# 安装浏览器端工具
pnpm add @cloudcome/utils-browser

# 安装 Node.js 端工具
pnpm add @cloudcome/utils-node

# 安装 Vue 3 工具库
pnpm add @cloudcome/utils-vue

# 安装 React 工具库
pnpm add @cloudcome/utils-react

# 安装 UniApp 工具库
pnpm add @cloudcome/utils-uni
```

### yarn

```bash
# 安装核心工具库
yarn add @cloudcome/utils-core

# 安装浏览器端工具
yarn add @cloudcome/utils-browser

# 安装 Node.js 端工具
yarn add @cloudcome/utils-node

# 安装 Vue 3 工具库
yarn add @cloudcome/utils-vue

# 安装 React 工具库
yarn add @cloudcome/utils-react

# 安装 UniApp 工具库
yarn add @cloudcome/utils-uni
```

## 依赖关系

各包之间的依赖关系如下：

- `@cloudcome/utils-browser` 依赖 `@cloudcome/utils-core`
- `@cloudcome/utils-vue` 依赖 `@cloudcome/utils-core`
- `@cloudcome/utils-react` 依赖 `@cloudcome/utils-core`
- `@cloudcome/utils-uni` 依赖 `@cloudcome/utils-core` 和 `@cloudcome/utils-vue`

安装时会自动安装所需的依赖。

## 配置

### TypeScript 配置

在 `tsconfig.json` 中添加类型声明：

```json
{
  "compilerOptions": {
    "types": ["@cloudcome/utils-core"]
  }
}
```

### Vite 配置

如果使用 Vite，无需额外配置，包会自动处理。

### Webpack 配置

如果使用 Webpack，确保支持 ES 模块：

```javascript
// webpack.config.js
module.exports = {
  experiments: {
    outputModule: true,
  },
};
```

## 验证安装

安装完成后，可以验证是否安装成功：

```typescript
import { VERSION } from '@cloudcome/utils-core';

console.log(VERSION); // 输出版本号
```

## 常见问题

### 安装失败

如果安装失败，请检查：

1. Node.js 版本是否 >= 22
2. 网络连接是否正常
3. npm/pnpm/yarn 是否为最新版本

### 类型提示不工作

如果 TypeScript 类型提示不工作，请检查：

1. 是否正确安装了类型声明
2. `tsconfig.json` 配置是否正确
3. IDE 是否支持 TypeScript

## 下一步

- [快速开始](/guide/getting-started) - 了解如何使用
- [utils-core](/utils-core/) - 查看核心工具库 API
