## Context

微信工具包 `@cloudcome/utils-uni/weixin` 包含两个核心服务构建函数：

- `buildWeixinAccessTokenService` — 获取微信 access_token，含缓存逻辑
- `buildSendWeixinNoticeService` — 发送微信订阅消息

当前问题：

1. `BuildWeixinAccessTokenServiceOptions` 中 `getTempDataService` 和 `setTempDataService` 命名过于泛化（"temp data"），未表达与 access_token 的关系
2. `SendData.clientEnv` 的取值 `'develop' | 'trial' | 'release'` 与微信 API 要求的 `miniprogram_state`（`'trial' | 'formal'`）存在隐式映射，调用方需要额外理解转换规则

## Goals / Non-Goals

**Goals:**

- 重命名 `getTempDataService` → `queryAccessToken`，清晰表达"查询 access_token"的语义
- 重命名 `setTempDataService` → `saveAccessToken`，清晰表达"保存 access_token"的语义
- `SendData` 去掉 `clientEnv`，改为直接接收 `miniprogramState: 'trial' | 'formal'`
- 同步更新所有测试和文档

**Non-Goals:**

- 不改变 token 缓存/获取的业务逻辑
- 不改变 notice 消息发送的业务逻辑
- 不新增或删除功能
- 不涉及其他模块

## Decisions

### 1. 命名纠正（用户原始请求的语义调整）

用户原始请求：
| 原名称 | 用户请求的新名称 | 实际语义 |
|--------|-----------------|---------|
| `getTempDataService` (读) | `saveAccessToken` | 读取缓存，应为 query |
| `setTempDataService` (写) | `queryAccessToken` | 保存缓存，应为 save |

已按语义纠正为：

- `getTempDataService` → `queryAccessToken` (读取查询)
- `setTempDataService` → `saveAccessToken` (写入保存)

**Rationale**: 避免产生命名混乱，使 API 调用方能够直觉理解函数用途。

### 2. `miniprogramState` 参数设计

原设计：`clientEnv: 'develop' | 'trial' | 'release'` → 内部转换为 `formal`/`trial`

新设计：`miniprogramState: 'trial' | 'formal'`

**Rationale**:

- 消除隐式转换，调用方直接决定跳转环境
- 与微信 API 字段名保持一致的 mental model
- 类型安全：调用方只能传入合法值

**Alternatives considered**:

- 保持 `clientEnv` 原样 → 拒绝：隐式转换增加认知负担
- 将 `clientEnv` 改为可选、默认 `formal` → 拒绝：仍然存在隐式转换

## Risks / Trade-offs

- [BREAKING CHANGE] 所有现有调用方需要更新：
  - `getTempDataService` → `queryAccessToken` 变量名
  - `setTempDataService` → `saveAccessToken` 变量名
  - `clientEnv` → `miniprogramState` 字段名
  - 值映射：`'release' | 'develop'` → `'formal'`，`'trial'` → `'trial'`
- [低风险] 纯重命名重构，可通过全局搜索替换确保无遗漏
