## 1. \_endHost 事务模式 query 分支修复

- [x] 1.1 在 `_endHost` 方法中，将事务模式 `doc(id)` 处理从仅 `update`/`remove` 扩展到 `query` 分支，事务模式下 `query` 也走 `doc(id).get()` 路径
- [x] 1.2 在 `_endHost` 方法中，事务模式下 `query` 分支若非 `whereId`，抛出明确错误

## 2. count 事务模式拦截

- [x] 2.1 在 `count()` 方法开头增加 `_isTransaction` 检查，事务模式下直接抛错

## 3. 验证

- [x] 3.1 确认非事务模式下 `firstOrThrow`/`firstOrNull`/`many`/`count` 行为不变
- [x] 3.2 确认事务模式下 `whereId` + `firstOrThrow`/`firstOrNull`/`many` 走 `doc(id).get()` 路径
- [x] 3.3 确认事务模式下非 `whereId` 查询抛出明确错误
- [x] 3.4 确认事务模式下 `count()` 抛出明确错误
