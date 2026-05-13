# 我的个人工具函数库

[![code-review](https://github.com/cloudcome/utils/actions/workflows/code-review.yml/badge.svg)](https://github.com/cloudcome/utils/actions/workflows/code-review.yml)
[![dependency-review](https://github.com/cloudcome/utils/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/cloudcome/utils/actions/workflows/dependency-review.yml)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/4fa1acaeb717469caddfe21a84c50bb2)](https://app.codacy.com/gh/cloudcome/utils/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/4fa1acaeb717469caddfe21a84c50bb2)](https://app.codacy.com/gh/cloudcome/utils/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)

跨平台、多框架的 TypeScript 工具函数库，覆盖浏览器、Node.js、Vue、React、UniApp 等环境。

## 包列表

| 名称 | 版本 | 描述 |
| --- | --- | --- |
| [@cloudcome/utils-core](./packages/utils-core) | [![npm version](https://badge.fury.io/js/@cloudcome%2Futils-core.svg)](https://npmjs.com/package/@cloudcome/utils-core) | 核心工具库，与运行环境无关的通用工具 |
| [@cloudcome/utils-browser](./packages/utils-browser) | [![npm version](https://badge.fury.io/js/@cloudcome%2Futils-browser.svg)](https://npmjs.com/package/@cloudcome/utils-browser) | 浏览器端工具（DOM、Canvas、Cookie、剪贴板等） |
| [@cloudcome/utils-node](./packages/utils-node) | [![npm version](https://badge.fury.io/js/@cloudcome%2Futils-node.svg)](https://npmjs.com/package/@cloudcome/utils-node) | Node.js 端工具（Base64、加密、JSONL 等） |
| [@cloudcome/utils-vue](./packages/utils-vue) | [![npm version](https://badge.fury.io/js/@cloudcome%2Futils-vue.svg)](https://npmjs.com/package/@cloudcome/utils-vue) | Vue 3 工具库（组合式函数、组件、请求等） |
| [@cloudcome/utils-react](./packages/utils-react) | [![npm version](https://badge.fury.io/js/@cloudcome%2Futils-react.svg)](https://npmjs.com/package/@cloudcome/utils-react) | React 工具库 |
| [@cloudcome/utils-uni](./packages/utils-uni) | [![npm version](https://badge.fury.io/js/@cloudcome%2Futils-uni.svg)](https://npmjs.com/package/@cloudcome/utils-uni) | UniApp 工具库（云函数、数据库、页面等） |
| [@cloudcome/docs](./packages/docs) | - | VitePress 文档站点 |

## 功能概览

### @cloudcome/utils-core

核心工具库，提供以下子模块：

| 子模块 | 导入路径 | 功能 |
| --- | --- | --- |
| array | `@cloudcome/utils-core/array` | 数组操作 |
| async | `@cloudcome/utils-core/async` | 异步工具 |
| base64 | `@cloudcome/utils-core/base64` | Base64 编解码 |
| cache | `@cloudcome/utils-core/cache` | 缓存工具 |
| color | `@cloudcome/utils-core/color` | 颜色转换（RGB/HSL/HSV/HWB/LAB/XYZ）、对比度、亮度、混合 |
| crypto | `@cloudcome/utils-core/crypto` | 加密（MD5、SHA1、SHA256、SHA512） |
| date | `@cloudcome/utils-core/date` | 日期解析、格式化、时区、相对时间、周/天计算 |
| dict | `@cloudcome/utils-core/dict` | 字典/映射工具 |
| easing | `@cloudcome/utils-core/easing` | 缓动函数 |
| emitter | `@cloudcome/utils-core/emitter` | 事件发射器 |
| env | `@cloudcome/utils-core/env` | 环境检测 |
| error | `@cloudcome/utils-core/error` | 错误处理 |
| exception | `@cloudcome/utils-core/exception` | 异常处理 |
| function | `@cloudcome/utils-core/function` | 函数工具 |
| number | `@cloudcome/utils-core/number` | 数字工具 |
| object | `@cloudcome/utils-core/object` | 对象遍历、深层 get/set、合并、类型判断 |
| path | `@cloudcome/utils-core/path` | 路径工具 |
| promise | `@cloudcome/utils-core/promise` | Promise 工具 |
| qs | `@cloudcome/utils-core/qs` | 查询字符串解析与序列化 |
| regexp | `@cloudcome/utils-core/regexp` | 正则表达式工具 |
| string | `@cloudcome/utils-core/string` | 字符串工具 |
| time | `@cloudcome/utils-core/time` | 时间单位转换 |
| timer | `@cloudcome/utils-core/timer` | 定时器工具 |
| tree | `@cloudcome/utils-core/tree` | 树结构操作 |
| try | `@cloudcome/utils-core/try` | 安全调用（try-catch 包装，支持同步/异步/柯里化） |
| type | `@cloudcome/utils-core/type` | 类型判断 |
| types | `@cloudcome/utils-core/types` | 公共类型定义 |
| unique | `@cloudcome/utils-core/unique` | 唯一 ID 生成 |
| url | `@cloudcome/utils-core/url` | URL 解析与构建 |
| version | `@cloudcome/utils-core/version` | 版本号比较 |

### @cloudcome/utils-browser

浏览器端工具库，依赖 `@cloudcome/utils-core`：

| 子模块 | 导入路径 | 功能 |
| --- | --- | --- |
| base64 | `@cloudcome/utils-browser/base64` | 浏览器端 Base64 编解码 |
| cache | `@cloudcome/utils-browser/cache` | 浏览器缓存（localStorage/sessionStorage） |
| canvas | `@cloudcome/utils-browser/canvas` | Canvas 操作 |
| clipboard | `@cloudcome/utils-browser/clipboard` | 剪贴板读写 |
| cookie | `@cloudcome/utils-browser/cookie` | Cookie 读写 |
| dom | `@cloudcome/utils-browser/dom` | DOM 操作 |
| download | `@cloudcome/utils-browser/download` | 文件下载 |
| image | `@cloudcome/utils-browser/image` | 图片处理 |
| timer | `@cloudcome/utils-browser/timer` | 浏览器端定时器 |
| video | `@cloudcome/utils-browser/video` | 视频处理 |

### @cloudcome/utils-node

Node.js 端工具库：

| 子模块 | 导入路径 | 功能 |
| --- | --- | --- |
| base64 | `@cloudcome/utils-node/base64` | Node.js 端 Base64 编解码 |
| crypto | `@cloudcome/utils-node/crypto` | Node.js 端加密工具 |
| jsonl | `@cloudcome/utils-node/jsonl` | JSONL 文件读写 |

### @cloudcome/utils-vue

Vue 3 工具库，依赖 `@cloudcome/utils-core` 和 `vue`：

| 子模块 | 导入路径 | 功能 |
| --- | --- | --- |
| async | `@cloudcome/utils-vue/async` | Vue 异步组合式函数 |
| component | `@cloudcome/utils-vue/component` | 组件工具（生命周期等） |
| event | `@cloudcome/utils-vue/event` | 事件工具 |
| request | `@cloudcome/utils-vue/request` | 请求组合式函数（useRequest） |
| shared | `@cloudcome/utils-vue/shared` | 共享工具 |
| state | `@cloudcome/utils-vue/state` | 状态管理工具 |
| time | `@cloudcome/utils-vue/time` | 时间相关组合式函数 |
| types | `@cloudcome/utils-vue/types` | 类型定义 |

### @cloudcome/utils-react

React 工具库。

### @cloudcome/utils-uni

UniApp 工具库，依赖 `@cloudcome/utils-core`、`@cloudcome/utils-vue`：

| 子模块 | 导入路径 | 功能 |
| --- | --- | --- |
| client | `@cloudcome/utils-uni/client` | 客户端工具（App/页面生命周期、消息提示、异步工具等） |
| cloud | `@cloudcome/utils-uni/cloud` | 云函数工具（调用、错误处理、uni-id 等） |
| database | `@cloudcome/utils-uni/database` | 数据库操作（CRUD、事务、分页、upsert 等） |

## 开发

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 许可

[MIT](LICENSE)
