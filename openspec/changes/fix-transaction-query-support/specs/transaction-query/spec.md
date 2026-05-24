## ADDED Requirements

### Requirement: 事务模式下查询必须使用 whereId

在事务模式下，`many()`、`firstOrThrow()`、`firstOrNull()` 方法 SHALL 要求查询条件必须通过 `whereId()` 指定 ID。若使用 `where()` 指定非 ID 条件，SHALL 在方法调用时抛出错误。

#### Scenario: 事务模式下使用 whereId 查询

- **WHEN** 在事务模式下调用 `db.whereId('xxx').firstOrNull()`
- **THEN** 方法 SHALL 通过 `doc(id).get()` 执行查询并返回结果

#### Scenario: 事务模式下使用 where 非 ID 条件查询

- **WHEN** 在事务模式下调用 `db.where({ name: 'test' }).firstOrNull()`
- **THEN** 方法 SHALL 抛出错误，提示事务模式下查询必须使用 whereId

#### Scenario: 事务模式下使用 where 多条件含 ID 但非纯 ID 条件查询

- **WHEN** 在事务模式下调用 `db.where({ _id: 'xxx', name: 'test' }).firstOrNull()`
- **THEN** 方法 SHALL 抛出错误，提示事务模式下查询必须使用 whereId

### Requirement: 事务模式下 firstOrThrow 正确返回单条记录

在事务模式下，`firstOrThrow()` SHALL 通过 `doc(id).get()` 查询单条记录。若记录存在则返回，不存在则抛出错误。

#### Scenario: 事务模式下 firstOrThrow 记录存在

- **WHEN** 在事务模式下调用 `db.whereId('xxx').firstOrThrow()`
- **THEN** 方法 SHALL 返回该条记录

#### Scenario: 事务模式下 firstOrThrow 记录不存在

- **WHEN** 在事务模式下调用 `db.whereId('nonexistent').firstOrThrow()`
- **THEN** 方法 SHALL 抛出"查询数据为空"错误

### Requirement: 事务模式下 firstOrNull 正确返回单条记录或 null

在事务模式下，`firstOrNull()` SHALL 通过 `doc(id).get()` 查询单条记录。若记录存在则返回，不存在则返回 null。

#### Scenario: 事务模式下 firstOrNull 记录存在

- **WHEN** 在事务模式下调用 `db.whereId('xxx').firstOrNull()`
- **THEN** 方法 SHALL 返回该条记录

#### Scenario: 事务模式下 firstOrNull 记录不存在

- **WHEN** 在事务模式下调用 `db.whereId('nonexistent').firstOrNull()`
- **THEN** 方法 SHALL 返回 null

### Requirement: 事务模式下 many 必须使用 whereId

在事务模式下，`many()` SHALL 要求查询条件必须通过 `whereId()` 指定 ID，并通过 `doc(id).get()` 执行查询，返回包含单条记录的数组。

#### Scenario: 事务模式下 many 使用 whereId

- **WHEN** 在事务模式下调用 `db.whereId('xxx').many()`
- **THEN** 方法 SHALL 返回包含该条记录的数组（长度为 1）

#### Scenario: 事务模式下 many 使用 where 非 ID 条件

- **WHEN** 在事务模式下调用 `db.where({ name: 'test' }).many()`
- **THEN** 方法 SHALL 抛出错误，提示事务模式下查询必须使用 whereId

### Requirement: 事务模式下 count 不支持

在事务模式下，`count()` SHALL 直接抛出错误，提示事务模式下不支持 count 操作。

#### Scenario: 事务模式下调用 count

- **WHEN** 在事务模式下调用 `db.count()`
- **THEN** 方法 SHALL 抛出错误，提示事务模式下不支持 count 操作

### Requirement: 非事务模式下行为不变

非事务模式下，所有查询方法 SHALL 保持现有行为不变。

#### Scenario: 非事务模式下 firstOrNull 使用 where 条件

- **WHEN** 在非事务模式下调用 `db.where({ name: 'test' }).firstOrNull()`
- **THEN** 方法 SHALL 正常执行查询并返回结果，行为与变更前一致
