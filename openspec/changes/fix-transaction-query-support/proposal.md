## Why

uniCloud 事务模式下，数据库查询只能通过 `doc(id).get()` 单条查询，不支持 `where(...).get()` 多条查询。当前 `Db` 类的 `firstOrThrow()`、`firstOrNull()`、`many()`、`count()` 在事务模式下仍走普通查询路径，会导致运行时错误。`_endHost` 方法仅对 `update`/`remove` 做了事务模式的 `doc(id)` 转换，`query` 和 `count` 分支未处理。

## What Changes

- **`_endHost` 方法**：`query` 和 `count` 分支在事务模式下也走 `doc(id)` 路径，事务模式下非 `whereId` 查询直接抛错
- **`firstOrThrow()`**：事务模式下用 `doc(id).get()` 直接查单条，不走 `many()`
- **`firstOrNull()`**：同上
- **`many()`**：事务模式下必须使用 `whereId`，否则抛错（由 `_endHost` 统一拦截）
- **`count()`**：事务模式下不支持，直接抛错

## Capabilities

### New Capabilities

- `transaction-query`: 事务模式下的查询行为约束与实现，包括 `firstOrThrow`、`firstOrNull`、`many`、`count` 在事务模式下的正确行为

### Modified Capabilities

## Impact

- 文件：`packages/utils-uni/src/database/_db.class.ts`
- API 行为变更：事务模式下调用 `many()`/`firstOrThrow()`/`firstOrNull()`/`count()` 不传 `whereId` 将抛错（之前是运行时数据库错误，现在是明确的参数校验错误）
- 无破坏性变更：非事务模式行为完全不变
