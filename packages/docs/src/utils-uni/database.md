---
outline: deep
---

# database

数据库操作工具。

## 导入

```typescript
import { dbQuery, dbMutate, dbProxy, dbUpsert, dbUnique, dbTransaction, dbPaging, parseDatabaseOutput } from '@cloudcome/utils-uni/database'
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
await dbTransaction(async (withTransaction) => {
  const users = withTransaction('users')
  const orders = withTransaction('orders')
  
  // 在事务中操作
  await users.doc('123').update({ balance: dbMutate.inc(-100) })
  await orders.create({ userId: '123', amount: 100 })
})
```

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
