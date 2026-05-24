## Why

当前 `where()` 和 `whereId()` 共用 `_doWhere` 内部方法，其中通过隐式判断 `isWhereId`（检查 where 对象是否为纯 `_id` 条件）来决定行为分支。这导致：1）`where({ _id: 'xxx' })` 和 `whereId('xxx')` 效果等价但语义不透明，造成困惑；2）事务模式下 `where()` 已被入口拦截，`_doWhere` 中的 `isWhereId` 判断在事务路径上永远不会触发，属于死逻辑；3）错误信息依赖 `_WhereFrom` 类型动态生成，增加了不必要的复杂度。

## What Changes

- 移除 `_doWhere` 共享方法，`where()` 和 `whereId()` 各自独立实现
- 移除 `_doWhere` 中的 `isWhereId` 隐式判断逻辑
- **BREAKING** `where({ _id: 'xxx' })` 不再被识别为 whereId 语义，必须使用 `whereId('xxx')`
- 移除 `_WhereFrom` 类型及 `_toWhereMethod` / `_toWhereIdMethod` 辅助函数
- 简化 `_hasWhere` 和 `_hasWhereId` 的类型（从 `_WhereFrom | undefined` 简化为 `boolean`）

## Capabilities

### New Capabilities

- `where-whereid-split`: where 和 whereId 方法独立实现，移除隐式 isWhereId 判断

### Modified Capabilities

## Impact

- 文件：`packages/utils-uni/src/database/_db.class.ts`
- **BREAKING**：`where({ _id: 'xxx' })` 不再等价于 `whereId('xxx')`，需检查所有调用点
- 移除 `_doWhere`、`_WhereFrom`、`_toWhereMethod`、`_toWhereIdMethod`
- `_hasWhere` / `_hasWhereId` 类型简化
