---
outline: deep
---

# @cloudcome/utils-uni

UniApp 工具库，提供云函数、数据库、页面等功能。

## 安装

```bash
npm install @cloudcome/utils-uni
```

## 依赖

- `@cloudcome/utils-core`
- `@cloudcome/utils-vue`

## 模块列表

| 模块     | 导入路径                        | 功能                               |
| -------- | ------------------------------- | ---------------------------------- |
| client   | `@cloudcome/utils-uni/client`   | 客户端工具（App、页面等）          |
| cloud    | `@cloudcome/utils-uni/cloud`    | 云函数工具                         |
| database | `@cloudcome/utils-uni/database` | 数据库操作                         |
| weixin   | `@cloudcome/utils-uni/weixin`   | 微信工具（access_token、订阅消息） |

## 版本号

```typescript
import { VERSION } from '@cloudcome/utils-uni';

console.log(VERSION); // 输出版本号
```

## 下一步

选择左侧菜单中的模块查看详细 API 文档。
