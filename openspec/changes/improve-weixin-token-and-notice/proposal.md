## Why

微信工具模块中 token 和 notice 的函数命名与实际语义不符，且 notice 的环境参数存在隐式转换，增加调用方的理解和维护成本。本次通过重命名和参数显性化提升代码可读性和类型安全。

## What Changes

1. **token.ts - 重命名**:
   - `getTempDataService` → `queryAccessToken` (**BREAKING**)
   - `setTempDataService` → `saveAccessToken` (**BREAKING**)
2. **notice.ts - 参数显性化** (**BREAKING**):
   - 移除 `SendData.clientEnv` 字段
   - 新增 `SendData.miniprogramState: 'trial' | 'formal'` 字段
   - 内部不再做环境映射转换
3. **同步更新**:
   - 单元测试（token.test.ts, notice.test.ts）
   - 文档（docs/src/utils-uni/weixin.md）
   - 所有引用这些 API 的代码

## Capabilities

### New Capabilities

无新增能力，本次为现有模块的 API 优化。

### Modified Capabilities

无 spec 级别的行为变更，仅实现细节变化。

<!-- Original naming from user request:
   getTempDataService → saveAccessToken (line 22)
   setTempDataService → queryAccessToken (line 29-30)
   Per semantic analysis, swapped to correct naming:
   getTempDataService (reads) → queryAccessToken ✓
   setTempDataService (writes/saves) → saveAccessToken ✓
-->

## Impact

- `packages/utils-uni/src/weixin/token.ts` — 类型定义变更
- `packages/utils-uni/src/weixin/notice.ts` — 类型定义 + 内部逻辑变更
- `packages/utils-uni/test/weixin/token.test.ts` — 同步测试 mock 变量名
- `packages/utils-uni/test/weixin/notice.test.ts` — 同步测试入参
- `packages/docs/src/utils-uni/weixin.md` — 更新文档示例
