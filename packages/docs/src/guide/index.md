---
outline: deep
---

# 介绍

`@cloudcome/utils` 是一个跨平台、多框架的 TypeScript 工具函数库，覆盖浏览器、Node.js、Vue、React、UniApp 等环境。

## 特性

- 🛠️ **核心工具库**：与运行环境无关的通用工具
- 🌐 **浏览器端工具**：DOM、Canvas、Cookie、剪贴板等
- 🖥️ **Node.js 端工具**：Base64、加密、JSONL 等
- 💚 **Vue 3 工具库**：组合式函数、组件、请求等
- ⚛️ **React 工具库**：React 相关工具函数
- 📱 **UniApp 工具库**：云函数、数据库、页面等

## 包结构

```
@cloudcome/utils
├── utils-core          # 核心工具库
├── utils-browser       # 浏览器端工具
├── utils-node          # Node.js 端工具
├── utils-vue           # Vue 3 工具库
├── utils-react         # React 工具库
└── utils-uni           # UniApp 工具库
```

## 设计原则

1. **类型安全**：完全使用 TypeScript 编写，提供完整的类型定义
2. **跨平台**：支持浏览器、Node.js、Vue、React、UniApp 等多个平台
3. **模块化**：按需导入，减少打包体积
4. **高性能**：优化算法，确保高性能
5. **易用性**：简洁的 API 设计，易于上手

## 下一步

- [快速开始](/guide/getting-started) - 了解如何安装和使用
- [安装指南](/guide/installation) - 详细的安装说明
- [utils-core](/utils-core/) - 查看核心工具库 API
