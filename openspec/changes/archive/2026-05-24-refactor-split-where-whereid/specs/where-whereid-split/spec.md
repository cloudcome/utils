## ADDED Requirements

### Requirement: where 和 whereId 独立实现

`where()` 和 `whereId()` SHALL 各自独立实现，不共享内部 `_doWhere` 方法。

#### Scenario: where 设置非 ID 条件

- **WHEN** 调用 `db.where({ name: 'test' })`
- **THEN** `_hasWhere` 为 true，`_hasWhereId` 为 false，`_where` 为 `{ name: 'test' }`

#### Scenario: whereId 设置 ID 条件

- **WHEN** 调用 `db.whereId('xxx')`
- **THEN** `_hasWhere` 为 true，`_hasWhereId` 为 true，`_where` 为 `{ _id: 'xxx' }`

#### Scenario: where 和 whereId 不能重复调用

- **WHEN** 调用 `db.where({ name: 'test' })` 后再调用 `db.whereId('xxx')`
- **THEN** SHALL 抛出错误，提示已调用过 where 方法

#### Scenario: whereId 后再调用 where

- **WHEN** 调用 `db.whereId('xxx')` 后再调用 `db.where({ name: 'test' })`
- **THEN** SHALL 抛出错误，提示已调用过 whereId 方法

### Requirement: where 不再隐式识别 \_id 条件

`where({ _id: 'xxx' })` SHALL 不再被识别为 whereId 语义，不会设置 `_hasWhereId`，不会触发 `doc(id)` 路径。

#### Scenario: where 传入 \_id 条件

- **WHEN** 调用 `db.where({ _id: 'xxx' })`
- **THEN** `_hasWhere` 为 true，`_hasWhereId` 为 false，走 `where().get()` 路径而非 `doc(id).get()` 路径

### Requirement: whereId 与 limit 互斥

`whereId()` 和 `limit()` SHALL 不能同时调用。

#### Scenario: whereId 后调用 limit

- **WHEN** 调用 `db.whereId('xxx')` 后再调用 `db.limit(10)`
- **THEN** SHALL 抛出错误

#### Scenario: limit 后调用 whereId

- **WHEN** 调用 `db.limit(10)` 后再调用 `db.whereId('xxx')`
- **THEN** SHALL 抛出错误

### Requirement: 移除 \_doWhere 和相关辅助

`_doWhere` 方法、`_WhereFrom` 类型、`_toWhereMethod` 和 `_toWhereIdMethod` 辅助函数 SHALL 被移除。

#### Scenario: 代码中不再存在这些定义

- **WHEN** 检查 `_db.class.ts` 源码
- **THEN** 不存在 `_doWhere`、`_WhereFrom`、`_toWhereMethod`、`_toWhereIdMethod` 的定义

### Requirement: \_hasWhere 和 \_hasWhereId 类型简化

`_hasWhere` 和 `_hasWhereId` SHALL 使用 `boolean` 类型，初始值为 `false`。

#### Scenario: 初始状态

- **WHEN** 创建新的 Db 实例
- **THEN** `_hasWhere` 为 `false`，`_hasWhereId` 为 `false`

## REMOVED Requirements

### Requirement: where 隐式识别 \_id 为 whereId

**Reason**: `where({ _id })` 和 `whereId()` 的隐式等价导致语义模糊，增加认知负担
**Migration**: 使用 `whereId('xxx')` 替代 `where({ _id: 'xxx' })`
