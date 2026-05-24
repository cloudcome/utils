## 1. 类型与辅助函数清理

- [x] 1.1 移除 `_WhereFrom` 类型定义
- [x] 1.2 `_hasWhere` 类型从 `_WhereFrom | undefined` 改为 `boolean`，初始值 `false`
- [x] 1.3 `_hasWhereId` 类型从 `_WhereFrom | undefined` 改为 `boolean`，初始值 `false`
- [x] 1.4 移除 `_toWhereMethod` 和 `_toWhereIdMethod` 辅助函数

## 2. where 和 whereId 独立实现

- [x] 2.1 `where()` 独立实现：重复调用检查、undefined 过滤、设置 `_hasWhere` 和 `_where`，移除 `isWhereId` 判断
- [x] 2.2 `whereId()` 独立实现：重复调用检查、与 limit 互斥检查、设置 `_hasWhere`、`_where`、`_hasWhereId`
- [x] 2.3 移除 `_doWhere` 方法

## 3. 更新引用点

- [x] 3.1 更新 `_endHost` 中 `_hasWhere` / `_hasWhereId` 的使用（类型从 `_WhereFrom` 改为 `boolean`）
- [x] 3.2 更新 `_endAggregate` 中 `_hasWhere` 的使用
- [x] 3.3 更新 `firstOrThrow` / `firstOrNull` 中 `_hasWhereId` 的使用
- [x] 3.4 更新 `limit()` 中 `_hasWhereId` 的使用和错误信息
- [x] 3.5 更新 `update()` / `remove()` 中 `_hasWhere` / `_hasWhereId` 的使用

## 4. 测试迁移

- [x] 4.1 将测试中 `where({ _id: 'xxx' })` 改为 `whereId('xxx')`
