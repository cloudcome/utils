## Why

`defineException` 是一个过度封装的工具函数，本质只是返回一个继承 Error 的匿名类。这种间接增加了理解成本，且限制了自定义错误类的灵活性（如无法扩展额外方法、不易做类型收窄）。去掉这层封装，让下游直接使用 `class extends Error` 更简单、更显式。

## What Changes

- **BREAKING**: 删除 `packages/utils-core/src/exception.ts`（`defineException`、`DefineExceptionOptions`）
- 删除 `packages/utils-core/test/exception.test.ts`
- 删除 `packages/docs/src/utils-core/exception.md`
- 删除 `packages/docs/src/utils-core/index.md` 中的 exception 引用
- 更新 `packages/utils-uni/src/database/error.ts`：`DbException` 从 `defineException` 改为 `class extends Error`
- 更新 `packages/utils-uni/src/database/error.ts`：`isDbException` 的类型断言相应更新
- 更新 `packages/utils-uni/src/database/_db.class.ts` 和 `proxy.ts` 中 `parseError` 回调的类型引用（`InstanceType<typeof DbException>` → `DbException`）

## Capabilities

### New Capabilities

- `<none>`: 本次不引入新能力

### Modified Capabilities

- `<none>`: 无 spec 级行为变更。`DbException` 的公开 API（`errCode`、`code`、`message`、`isDbException`）保持不变

## Impact

- `@cloudcome/utils-core/exception` 模块将被删除，任何直接引用该路径的代码需要迁移
- `@cloudcome/utils-uni` 的 `database/error.ts` 是唯一的下游使用者，已确认修改方案
- `DbException` 的 `message` 不再带有 `[DbError]` 前缀（此前 `defineException` 自动添加的格式化），保持原始 `errMsg`
