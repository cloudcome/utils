## Context

`Db` 类（`_db.class.ts`）封装了 uniCloud 数据库操作，支持普通模式和事务模式。uniCloud 事务模式下有严格限制：

- 查询只能通过 `doc(id).get()` 单条查询，不能 `where(...).get()`
- 查询条件只能是 ID

当前 `_endHost` 方法仅对 `update`/`remove` 做了事务模式处理（`doc(id)` 转换），`query` 和 `count` 分支未处理，导致事务模式下调用 `firstOrThrow()`、`firstOrNull()`、`many()`、`count()` 会产生运行时数据库错误。

## Goals / Non-Goals

**Goals:**

- 事务模式下 `firstOrThrow()` / `firstOrNull()` 通过 `doc(id).get()` 正确查单条
- 事务模式下 `many()` 通过 `doc(id).get()` 正确查单条（必须用 `whereId`）
- 事务模式下 `count()` 直接抛错（uniCloud 事务不支持 count）
- 事务模式下非 `whereId` 查询在调用前就抛出明确错误，而非等到数据库层报错

**Non-Goals:**

- 不改变非事务模式下的任何行为
- 不支持事务模式下的聚合查询（lookup/sample）
- 不支持事务模式下的 `where` 条件查询

## Decisions

### 1. 统一在 `_endHost` 中处理事务模式的 `query` 分支

**选择**：在 `_endHost` 的 `query` 分支中，事务模式下也走 `doc(id)` 路径，与 `update`/`remove` 保持一致。

**理由**：`_endHost` 是所有操作的统一出口，在这里处理可以确保 `many()` 和 `firstOrThrow()`/`firstOrNull()` 都能正确工作，无需在每个方法中重复判断。

**替代方案**：在 `firstOrThrow`/`firstOrNull` 中单独处理事务模式，不走 `many()`。但这会导致逻辑分散，且 `many()` 本身在事务模式下仍然有问题。

### 2. `firstOrThrow` / `firstOrNull` 事务模式下仍走 `many()`

**选择**：事务模式下 `firstOrThrow`/`firstOrNull` 继续走 `many()`，由 `_endHost` 统一处理 `doc(id)` 转换。

**理由**：`_endHost` 处理后，`many()` 在事务模式下返回单条记录的数组，`firstOrThrow`/`firstOrNull` 取 `at(0)` 逻辑不变，代码改动最小。

### 3. `count()` 事务模式下直接抛错

**选择**：在 `count()` 方法开头检查 `_isTransaction`，事务模式下直接抛错。

**理由**：uniCloud 事务模式不支持 count 操作，没有可用的替代方案。

## Risks / Trade-offs

- **[行为变更]** 事务模式下非 `whereId` 查询从"运行时数据库错误"变为"调用前明确抛错" → 这是改善，不是破坏性变更
- **[遗漏场景]** 如果有代码在事务模式下使用 `where` 查询且碰巧只有一条记录，之前可能正常工作 → 现在会抛错，但这是正确行为，因为 uniCloud 不保证该场景的可靠性
