## Context

当前 `where()` 和 `whereId()` 共用 `_doWhere` 私有方法，内部通过 `isWhereId` 隐式判断（检查 where 对象是否为 `{ _id: string | number }`）来决定是否设置 `_hasWhereId`。事务模式下 `where()` 已在入口拦截，`isWhereId` 判断在事务路径上成为死逻辑。`_WhereFrom` 类型和 `_toWhereMethod` / `_toWhereIdMethod` 辅助函数仅用于动态生成错误信息，增加了不必要的复杂度。

## Goals / Non-Goals

**Goals:**

- `where()` 和 `whereId()` 各自独立实现，消除隐式 `isWhereId` 判断
- 移除 `_doWhere`、`_WhereFrom`、`_toWhereMethod`、`_toWhereIdMethod`
- `_hasWhere` / `_hasWhereId` 类型从 `_WhereFrom | undefined` 简化为 `boolean`
- 错误信息直接在各方法中硬编码，不再动态生成

**Non-Goals:**

- 不改变 `where()` 和 `whereId()` 的外部行为（除了 `where({ _id })` 不再等价于 `whereId`）
- 不改变 `_endHost` / `_endAggregate` 中的查询执行逻辑

## Decisions

### 1. `where()` 独立实现

**选择**：`where()` 直接包含重复调用检查、undefined 过滤、设置 `_hasWhere` 和 `_where`，不再调用 `_doWhere`。

**理由**：逻辑简单，不值得共享方法。移除 `_doWhere` 后代码更直观。

### 2. `whereId()` 独立实现

**选择**：`whereId()` 直接包含重复调用检查、与 `limit` 互斥检查、设置 `_hasWhere`、`_where`、`_hasWhereId`。

**理由**：`whereId` 的逻辑比 `where` 更简单（不需要 undefined 过滤、不需要 `isWhereId` 判断），独立实现更清晰。

### 3. `_hasWhere` / `_hasWhereId` 简化为 `boolean`

**选择**：从 `_WhereFrom | undefined` 改为 `boolean`，初始值 `false`。

**理由**：`_WhereFrom` 的值仅用于生成错误信息，独立实现后不再需要。`_hasWhere` 和 `_hasWhereId` 可以同时为 true（`whereId` 设置两者）。

### 4. 移除 `where({ _id })` 的隐式 whereId 语义

**选择**：`where({ _id: 'xxx' })` 不再自动设置 `_hasWhereId`，不再触发 `doc(id)` 路径。

**理由**：`whereId()` 存在的意义就是明确表达按 ID 查询的意图。允许 `where({ _id })` 隐式等价于 `whereId` 会导致语义模糊。

## Risks / Trade-offs

- **[Breaking Change]** `where({ _id: 'xxx' })` 不再等价于 `whereId('xxx')` → 影响范围仅测试文件 2 处，迁移方式：改用 `whereId('xxx')`
- **[重复代码]** `where()` 和 `whereId()` 有少量重复（重复调用检查） → 重复量极小，可接受
