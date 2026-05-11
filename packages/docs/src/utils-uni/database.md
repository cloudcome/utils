---
outline: deep
---

# database

数据库操作工具。

## 导入

```typescript
import { dbQuery, dbMutate, dbProxy, dbUpsert, dbUnique, dbTransaction, dbPaging, dbEach, parseDatabaseOutput } from '@cloudcome/utils-uni/database'
```

## 类型定义

### DbWhere\<T\>

```typescript
type DbWhere<T> = {
  [K in keyof T]?: T[K] | DbQueryCommand
}
```

### DbSelect\<T\>

```typescript
type DbSelect<T> = {
  [K in keyof T]?: 0 | 1
}
```

### DbOrder\<T\>

```typescript
type DbOrder<T> = {
  [K in keyof T]?: 'asc' | 'desc'
}
```

### DbCreate\<T\>

```typescript
type DbCreate<T> = Partial<T>
```

### DbUpdate\<T\>

```typescript
type DbUpdate<T> = {
  [K in keyof T]?: T[K] | DbMutateCommand
}
```

### DbUpsertOutput

```typescript
interface DbUpsertOutput {
  id: string
  created: boolean
  updated?: boolean
}
```

## 对象

### dbQuery

数据库查询操作符。

```typescript
const dbQuery = {
  eq(value: unknown): DbQueryCommand
  neq(value: unknown): DbQueryCommand
  gt(value: unknown): DbQueryCommand
  gte(value: unknown): DbQueryCommand
  lt(value: unknown): DbQueryCommand
  lte(value: unknown): DbQueryCommand
  in(value: unknown[]): DbQueryCommand
  nin(value: unknown[]): DbQueryCommand
  size(size: number): DbQueryCommand
  regExp(regExp: RegExp): DbQueryCommand
  and(conditions: DbQueryCommand[]): DbQueryCommand
  or(conditions: DbQueryCommand[]): DbQueryCommand
}
```

**示例**

```typescript
// 等于
const users = await db.collection('users')
  .where({ age: dbQuery.eq(18) })
  .get()

// 大于
const adults = await db.collection('users')
  .where({ age: dbQuery.gt(18) })
  .get()

// 在范围内
const ids = ['1', '2', '3']
const users = await db.collection('users')
  .where({ _id: dbQuery.in(ids) })
  .get()

// 正则匹配
const emails = await db.collection('users')
  .where({ email: dbQuery.regExp(/@example\.com$/) })
  .get()

// 组合条件
const users = await db.collection('users')
  .where({
    age: dbQuery.gte(18),
    status: dbQuery.in(['active', 'pending'])
  })
  .get()
```

### dbMutate

数据库更新操作符。

```typescript
const dbMutate = {
  inc(value: number): DbMutateCommand
  mul(value: number): DbMutateCommand
  set(value: unknown): DbMutateCommand
  push(value: unknown): DbMutateCommand
  unshift(value: unknown): DbMutateCommand
  pop(): DbMutateCommand
  shift(): DbMutateCommand
  remove(): DbMutateCommand
}
```

**示例**

```typescript
// 增加
await db.collection('users').doc('123').update({
  score: dbMutate.inc(10)
})

// 乘以
await db.collection('products').doc('456').update({
  price: dbMutate.mul(1.1)
})

// 设置
await db.collection('users').doc('123').update({
  name: dbMutate.set('Bob')
})

// 数组操作
await db.collection('users').doc('123').update({
  tags: dbMutate.push('vip')
})
```

## 函数

### dbProxy

创建数据库代理。

```typescript
function dbProxy<D1, S1 extends DbSelect<D1> = {}>(
  name: string,
  options?: DbProxyOptions
): Db<D1, S1>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| name | `string` | 集合名称 |
| options | `DbProxyOptions` | 可选配置 |

**返回值**

`Db<D1, S1>` - 数据库实例

**示例**

```typescript
interface User {
  _id: string
  name: string
  age: number
}

const users = dbProxy<User>('users')

// 查询
const user = await users.where({ age: dbQuery.gte(18) }).first()

// 创建
await users.create({ name: 'Alice', age: 25 })

// 更新
await users.doc('123').update({ age: 26 })

// 删除
await users.doc('123').remove()
```

### Db 实例方法

`dbProxy` 返回的 `Db` 实例支持以下链式调用和终端方法。

#### where()

设置查询条件。

```typescript
where(where: DbWhere<T>): Db<T>
```

::: warning
- `where()` 和 `whereId()` 只能调用一次，重复调用会抛出错误
- 当 `where({ _id: '...' })` 中 `_id` 为字符串或数字时，不能与 `limit()` 同时调用
:::

#### whereId()

根据 ID 设置查询条件。

```typescript
whereId(id: string | number): Db<T>
```

::: warning
- `where()` 和 `whereId()` 只能调用一次，重复调用会抛出错误
- `whereId()` 不能与 `limit()` 同时调用
:::

#### select()

指定要返回的字段。

```typescript
select<S extends DbSelect<T>>(fields: S): Db<T, S>
```

::: warning
- `select()` 只能调用一次，重复调用会抛出错误
:::

#### order()

设置排序规则。

```typescript
order(order: DbOrder<T>): Db<T>
```

#### skip()

跳过指定数量的记录。

```typescript
skip(skip: number): Db<T>
```

::: warning
- `skip()` 只能调用一次，重复调用会抛出错误
:::

#### limit()

限制返回的记录数量。

```typescript
limit(limit: number): Db<T>
```

::: warning
- `limit()` 只能调用一次，重复调用会抛出错误
- `limit()` 不能与 `where({ _id })` 或 `whereId()` 同时调用
:::

#### lookup()

关联查询。

```typescript
lookup<FD1, FS1, FD2, FW2, RL extends DbRelation, AS extends string>(
  table: Db<FD1, FS1, FD2, FW2>,
  options: DbLookupOptions<RL, T, FD1, AS>
): Db<T, S1, D2 & DbForeign<FD1, FS1, FD2, RL, AS>>
```

#### many()

执行查询，返回所有匹配记录。

```typescript
many(): Promise<DbQuery<T, S1, D2>[]>
```

::: danger
- 不支持事务模式
:::

#### firstOrThrow()

查询一条记录，无结果时抛出错误。

```typescript
firstOrThrow(): Promise<DbQuery<T, S1, D2>>
```

::: danger
- 不支持事务模式
- 不支持 `limit` 条件
:::

#### firstOrNull()

查询一条记录，无结果时返回 null。

```typescript
firstOrNull(): Promise<DbQuery<T, S1, D2> | null>
```

::: danger
- 不支持事务模式
- 不支持 `limit` 条件
:::

#### count()

获取匹配记录的数量。

```typescript
count(): Promise<number>
```

::: danger
- 不支持事务模式
- 不支持 `lookup` 聚合
- 不支持 `select`、`order`、`skip`、`limit` 条件
:::

#### create()

创建新记录。

```typescript
create(data: DbCreate<T>): Promise<string>
```

::: danger
- 不支持 `lookup` 聚合
- 不支持 `where`、`select`、`order`、`skip`、`limit` 条件
:::

#### update()

更新记录。

```typescript
update(data: DbUpdate<T>): Promise<number>
```

::: danger
- 不支持 `lookup` 聚合
- 必须设置 `where` 条件后才能执行
- 不支持 `select`、`order`、`skip`、`limit` 条件
- 事务模式下 `where` 条件必须是 `_id`（即使用 `where({ _id })` 或 `whereId()`）
:::

#### remove()

删除记录。

```typescript
remove(): Promise<number>
```

::: danger
- 不支持 `lookup` 聚合
- 必须设置 `where` 条件后才能执行
- 不支持 `select`、`order`、`skip`、`limit` 条件
- 事务模式下 `where` 条件必须是 `_id`（即使用 `where({ _id })` 或 `whereId()`）
:::

### dbUpsert

数据库 upsert 操作（存在则更新，不存在则创建）。

```typescript
function dbUpsert<D1, C extends DbCreate<D1>, U extends DbUpdate<D1>>(
  db: Db<D1>,
  options: DbUpsertOptions<D1, C, U>
): Promise<DbUpsertOutput>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| db | `Db<D1>` | 数据库实例 |
| options | `DbUpsertOptions<D1, C, U>` | 配置选项 |

**返回值**

`Promise<DbUpsertOutput>` - upsert 结果

**示例**

```typescript
const result = await dbUpsert(users, {
  create: { name: 'Alice', age: 25 },
  update: { age: 26 },
  onBeforeCreate: (data) => {
    console.log('即将创建:', data)
  },
  onAfterCreate: (data) => {
    console.log('创建完成:', data)
  }
})

console.log(result.id) // 文档 ID
console.log(result.created) // 是否是新创建的
```

### dbUnique

数据库唯一性检查并 upsert。

```typescript
function dbUnique<T, C extends DbCreate<T>>(
  db: Db<T>,
  options: DbUniqueOptions<T, C>
): Promise<DbUniqueOutput>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| db | `Db<T>` | 数据库实例 |
| options | `DbUniqueOptions<T, C>` | 配置选项 |

**返回值**

`Promise<DbUniqueOutput>` - 操作结果

**示例**

```typescript
const result = await dbUnique(users, {
  where: { email: 'alice@example.com' },
  create: { name: 'Alice', email: 'alice@example.com', age: 25 },
  update: { age: 26 }
})
```

### dbTransaction

数据库事务。

```typescript
function dbTransaction<K>(
  transacting: (withTransaction: WithTransaction) => Promise<K>,
  _mockDatabase?: any,
  _mockDbInstance?: any
): Promise<K>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| transacting | `(withTransaction: WithTransaction) => Promise<K>` | 事务函数 |

**返回值**

`Promise<K>` - 事务结果

**示例**

```typescript
const users = dbProxy<User>('users')
const orders = dbProxy<Order>('orders')

await dbTransaction(async (withTransaction) => {
  const transUsers = withTransaction(users)
  const transOrders = withTransaction(orders)

  // 在事务中操作
  await transUsers.doc('123').update({ balance: dbMutate.inc(-100) })
  await transOrders.create({ userId: '123', amount: 100 })
})
```

::: danger
以下 Db 实例方法**不支持事务模式**，在事务中调用会抛出错误：

- `many()` — 事务中不支持查询多条记录
- `firstOrThrow()` — 事务中不支持查询单条记录（无结果时抛错）
- `firstOrNull()` — 事务中不支持查询单条记录（无结果时返回 null）
- `count()` — 事务中不支持计数查询
:::

### dbPaging

数据库分页查询。

```typescript
function dbPaging<D1, S1 extends DbSelect<D1> = {}, D2 extends AnyObject = {}, W2 extends AnyObject = {}>(
  queryDb: Db<D1, S1, D2, W2>
): Promise<{ list: DbQuery<D1, S1, D2>[]; total: number }>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| queryDb | `Db<D1, S1, D2, W2>` | 数据库查询实例（已设置 where、order、skip、limit） |

**返回值**

`Promise<{ list: DbQuery<D1, S1, D2>[]; total: number }>` - 分页结果

**示例**

```typescript
const { list, total } = await dbPaging(
  users
    .where({ age: dbQuery.gte(18) })
    .order({ createdAt: 'desc' })
    .skip(0)
    .limit(10)
)

console.log(list) // 当前页数据
console.log(total) // 总数
```

### dbEach

遍历表中的每一行数据并执行回调函数。采用分批查询策略，每批查询 100 条记录，通过 skip/limit 实现分页遍历，避免一次性加载大量数据导致内存溢出。迭代器按顺序串行执行。

```typescript
function dbEach<T>(
  table: Db<T>,
  where: DbWhere<T>,
  iterator: (row: T) => Promise<unknown>,
  maxCount?: number
): Promise<void>
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| table | `Db<T>` | 数据库表代理对象 |
| where | `DbWhere<T>` | 查询条件 |
| iterator | `(row: T) => Promise<unknown>` | 对每一行数据执行的异步迭代器函数 |
| maxCount | `number` | 最大遍历数量，默认值为 `Number.MAX_SAFE_INTEGER` |

::: warning
由于分批查询机制（每批 100 条），实际遍历的行数可能略大于 `maxCount`。例如 `maxCount=150` 时，会分两批查询（0-99、100-199），实际遍历 200 行。
:::

**示例**

```typescript
// 遍历所有状态为 active 的用户
await dbEach(users, { status: 'active' }, async (user) => {
  await sendEmail(user.email)
})

// 限制最多遍历 500 条记录
await dbEach(orders, { status: 'pending' }, async (order) => {
  await processOrder(order)
}, 500)
```

### parseDatabaseOutput

解析数据库输出。

```typescript
function parseDatabaseOutput<T>(
  res: ClientDatabaseOutput<T> | CloudDatabaseOutput<T>
): T
```

**参数**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| res | `ClientDatabaseOutput<T> \| CloudDatabaseOutput<T>` | 数据库输出 |

**返回值**

`T` - 解析后的数据

**示例**

```typescript
const res = await db.collection('users').doc('123').get()
const user = parseDatabaseOutput(res)
console.log(user)
```
