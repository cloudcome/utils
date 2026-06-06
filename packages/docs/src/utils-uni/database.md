---
outline: deep
---

# database

数据库操作工具。

## 导入

```typescript
import {
  dbQuery,
  dbMutate,
  dbProxy,
  dbUpsert,
  dbUnique,
  dbTransaction,
  dbPaging,
  dbEach,
  parseDatabaseOutput,
  isDbError,
} from '@cloudcome/utils-uni/database';
import type {
  DbWhere,
  DbSelect,
  DbOrder,
  DbCreate,
  DbUpdate,
  DbFieldsDefault,
  DbUniqueOutput,
  DbUpsertOutput,
  DbQuery,
  DbRelation,
  DbForeign,
  DbFields,
  DbBaseCommand,
  DbQueryCommand,
  DbMutateCommand,
  DbGroupCommand,
  DbError,
  DbOptions,
  DbLookupOptions,
  DbLookup,
  DbProxyOptions,
  DbUpsertOptions,
  DbUniqueOptions,
  ClientDatabaseOutput,
  CloudDatabaseOutput,
  WithTransaction,
  UniError,
} from '@cloudcome/utils-uni/database';
```

## 类型定义

### DbWhere\<T\>

```typescript
type DbWhere<T> = {
  [K in keyof T]?: T[K] | DbQueryCommand;
};
```

### DbSelect\<T\>

```typescript
type DbSelect<T> = {
  [K in keyof T]?: K extends '_id' ? boolean : true;
};
```

### DbBaseCommand

数据库命令基类，`DbQueryCommand` 和 `DbMutateCommand` 的父类。

```typescript
class DbBaseCommand {
  static getValue(cmd: DbBaseCommand, db: UniCloud.Database): unknown;
  static isQueryCommand(cmd: DbBaseCommand): boolean;
  static isMutateCommand(cmd: DbBaseCommand): boolean;
}
```

### DbQueryCommand

数据库查询命令类，用于构建查询条件。

```typescript
class DbQueryCommand extends DbBaseCommand {}
```

### DbMutateCommand

数据库更新命令类，用于构建更新条件。

```typescript
class DbMutateCommand extends DbBaseCommand {}
```

### DbGroupCommand\<T\>

数据库分组命令类，用于构建分组聚合累加器。泛型参数 `T` 携带累加器的值类型，在 `group()` 返回类型中由类型系统自动反推字段类型。

```typescript
class DbGroupCommand<T> extends DbBaseCommand {
  declare readonly __type: T; // 编译期占位、运行时无副作用
  toAggregate(): Record<string, unknown>;
}
```

**方法**

| 方法          | 返回值                    | 描述                                                     |
| ------------- | ------------------------- | -------------------------------------------------------- |
| `toAggregate` | `Record<string, unknown>` | 转换为 MongoDB 原生聚合操作符对象（如 `{ $sum: '$x' }`） |

**说明**

- `DbGroupCommand` 是 `db.dbGroup` 各个累加器方法（`sum`/`avg`/`min`/`max`/`push`/`addToSet`/`first`/`last`）的返回值
- 仅作为类型标记，运行时由 `_db.class.ts` 内部转换为 MongoDB 聚合操作符
- `T` 是**phantom type**（通过 `declare readonly __type: T` 实现），让 `DbGroupCommand<number>` 与 `DbGroupCommand<unknown>` 在结构上真正可区分
- 泛型**无默认值**，必须显式指定 T；约束处使用 `DbGroupCommand<any>` 作为变型逃生口，由 `group()` 的 `infer T` 在调用点提取每个累加器实例的具体值类型

### ClientDatabaseOutput\<T\>

客户端数据库输出类型。

```typescript
type ClientDatabaseOutput<T> = {
  result: T & UniErrorData;
};
```

### CloudDatabaseOutput\<T\>

云端数据库输出类型。

```typescript
type CloudDatabaseOutput<T> = T;
```

### DbQuery\<D1, S1, D2\>

数据库查询结果类型，结合主表查询字段和关联数据。

```typescript
type DbQuery<D1, S1 extends DbSelect<D1>, D2> = { ... }
```

### DbRelation

数据库关联关系类型。

- `'1:1'`: 一对一关联，返回单个对象
- `'1:n'`: 一对多关联，返回数组
- `'n:1'`: 多对一关联，返回数组

```typescript
type DbRelation = '1:1' | '1:n' | 'n:1';
```

### DbForeign\<MainData, RelatedData, RelatedSelect, RelatedExtra, RL, AS, LF\>

数据库外键关联类型，根据关联关系和 `localField` 是否可选决定返回类型。

- `1:1` 关系：若 `localField` 为可选（`?` 或 `| null`），返回 `DbQuery | null`；否则返回 `DbQuery`
- `1:n` / `n:1` 关系：始终返回数组

```typescript
type DbForeign<
  MainData,
  RelatedData,
  RelatedSelect extends DbSelect<RelatedData>,
  RelatedExtra,
  RL extends DbRelation,
  AS extends string,
  LF extends keyof MainData,
> = Record<
  AS,
  RL extends '1:1'
    ? IsNullable<MainData[LF]> extends true
      ? DbQuery<RelatedData, RelatedSelect, RelatedExtra> | null
      : DbQuery<RelatedData, RelatedSelect, RelatedExtra>
    : DbQuery<RelatedData, RelatedSelect, RelatedExtra>[]
>;
```

### DbFields\<D, S\>

数据库字段处理类型。

```typescript
type DbFields<D, S extends DbSelect<D>> = { ... }
```

### DbFieldsDefault\<T\>

数据库默认字段类型，将所有字段设为 `true`。

```typescript
type DbFieldsDefault<T> = {
  [K in keyof T]: true;
};
```

**说明**

当未调用 `select()` 指定字段时，内部使用此类型表示返回所有字段。

### DbOptions

`Db` 类的构造选项。

```typescript
interface DbOptions {
  table: string;
  transaction?: any;
  _mockDatabase?: any;
  parseError?: (error: unknown) => UniError;
}
```

### DbLookupOptions\<RL, D1, FD1, AS, LF\>

数据库关联查询选项。

```typescript
interface DbLookupOptions<RL extends DbRelation, D1, FD1, AS, LF extends keyof D1 & string = keyof D1 & string> {
  relation: RL;
  localField: LF;
  foreignField: keyof FD1 & string;
  as: AS;
  unselect?: boolean;
}
```

### DbProxyOptions

`dbProxy` 函数配置选项。

```typescript
interface DbProxyOptions {
  parseError?: (error: unknown) => UniError;
}
```

### DbError

数据库底层异常类。当 uniCloud 数据库操作（查询、创建、更新、删除等）抛出错误时，统一包装为该异常。可通过 `isDbError()` 判断。

```typescript
class DbError extends Error {
  errCode: string | number;
  dbCode: string;

  constructor(message: string, extra: { errCode: string | number; dbCode: string });
}
```

**属性**

| 属性      | 类型               | 描述                                              |
| --------- | ------------------ | ------------------------------------------------- |
| `errCode` | `string \| number` | 原始错误码，如 `'InternalServerError'`            |
| `dbCode`  | `string`           | MongoDB 错误码，如 `'E11000'`。不匹配则为空字符串 |
| `message` | `string`           | 原始错误消息 `errMsg`                             |

**示例**

```typescript
import { isDbError } from '@cloudcome/utils-uni/database';

try {
  await db.many();
} catch (err) {
  if (isDbError(err)) {
    console.log(err.dbCode); // 'E11000'
    console.log(err.errCode); // 'InternalServerError'
    console.log(err.message); // 'E11000 duplicate key error...'
  } else {
    throw err; // 非 DB 底层错误，重新抛出
  }
}
```

### isDbError

判断错误是否为数据库底层错误（`DbError`）。

```typescript
function isDbError(err: unknown): err is DbError;
```

::: tip
在 DB 操作（`many`、`firstOrThrow`、`create`、`update`、`remove`、`count`）的 catch 块中，所有携带 `errMsg` 属性的错误都会被自动包装为 `DbError`。不携带 `errMsg` 的错误（如网络中断等非 DB 异常）会原样抛出。
:::

### DbUpsertOptions\<T, C, U\>

`dbUpsert` 函数配置选项。

```typescript
interface DbUpsertOptions<T, C extends DbCreate<T>, U extends DbUpdate<T>> {
  create: C;
  update: U | ((exist: DbQuery<T, {}, {}>) => U);
  onBeforeCreate?: () => unknown;
  onAfterCreate?: (id: string) => unknown;
  onBeforeUpdate?: (exist: DbQuery<T, {}, {}>) => false | unknown;
  onAfterUpdate?: (updateData: U, exist: DbQuery<T, {}, {}>) => unknown;
  _mockDbInstance?: any;
}
```

### DbUniqueOptions\<T, C\>

`dbUnique` 函数配置选项。

```typescript
interface DbUniqueOptions<T, C extends DbCreate<T>> {
  create: C;
  onBeforeCreate?: () => unknown;
  onAfterCreate?: (id: string) => unknown;
  _mockDbInstance?: any;
}
```

### WithTransaction

事务数据库实例包装函数类型。

```typescript
type WithTransaction = <D1>(db: Db<D1>) => Db<D1>;
```

### DbOrder\<T\>

```typescript
type DbOrder<T> = {
  [K in keyof T]?: 'asc' | 'desc';
};
```

### DbCreate\<T\>

```typescript
type DbCreate<T> = Omit<T, '_id'> & { _id?: string };
```

### DbUpdate\<T\>

```typescript
type DbUpdate<T> = T extends AnyObject
  ? {
      [K in keyof T]?: DbUpdate<T[K]> | DbMutateCommand;
    }
  : T;
```

### DbUniqueOutput

```typescript
interface DbUniqueOutput {
  id: string;
  created: boolean;
}
```

### DbUpsertOutput

```typescript
interface DbUpsertOutput {
  id: string;
  created: boolean;
  updated: boolean;
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
const users = await db
  .collection('users')
  .where({ age: dbQuery.eq(18) })
  .get();

// 大于
const adults = await db
  .collection('users')
  .where({ age: dbQuery.gt(18) })
  .get();

// 在范围内
const ids = ['1', '2', '3'];
const users = await db
  .collection('users')
  .where({ _id: dbQuery.in(ids) })
  .get();

// 正则匹配
const emails = await db
  .collection('users')
  .where({ email: dbQuery.regExp(/@example\.com$/) })
  .get();

// 组合条件
const users = await db
  .collection('users')
  .where({
    age: dbQuery.gte(18),
    status: dbQuery.in(['active', 'pending']),
  })
  .get();
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
await db
  .collection('users')
  .doc('123')
  .update({
    score: dbMutate.inc(10),
  });

// 乘以
await db
  .collection('products')
  .doc('456')
  .update({
    price: dbMutate.mul(1.1),
  });

// 设置
await db
  .collection('users')
  .doc('123')
  .update({
    name: dbMutate.set('Bob'),
  });

// 数组操作
await db
  .collection('users')
  .doc('123')
  .update({
    tags: dbMutate.push('vip'),
  });
```

## 函数

### dbProxy

创建数据库代理。

```typescript
function dbProxy<D1, S1 extends DbSelect<D1> = {}>(name: string, options?: DbProxyOptions): Db<D1, S1>;
```

**参数**

| 参数    | 类型             | 描述     |
| ------- | ---------------- | -------- |
| name    | `string`         | 集合名称 |
| options | `DbProxyOptions` | 可选配置 |

**返回值**

`Db<D1, S1>` - 数据库实例

**示例**

```typescript
interface User {
  _id: string;
  name: string;
  age: number;
}

const users = dbProxy<User>('users');

// 查询
const user = await users.where({ age: dbQuery.gte(18) }).firstOrThrow();

// 根据 ID 查询
const userById = await users.whereId('123').firstOrThrow();

// 创建
const createdId = await users.create({ name: 'Alice', age: 25 });

// 更新
await users.whereId('123').update({ age: 26 });

// 删除
await users.whereId('123').remove();

// select 指定返回字段（返回类型会自动推断）
const partialUser = await users.whereId('123').select({ _id: true, name: true }).firstOrThrow();
// partialUser 类型: { _id: string; name: string }
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
- 事务模式下不允许调用 `where()`，请使用 `whereId()` 方法
- `where({ _id: '...' })` 不会自动识别为 `whereId` 语义，如需按 ID 查询请使用 `whereId()`
  :::

#### whereId()

根据 ID 设置查询条件。

```typescript
whereId(id: string | number): Db<T>
```

::: warning

- `where()` 和 `whereId()` 只能调用一次，重复调用会抛出错误
- `whereId()` 不能与 `limit()` 同时调用
- 事务模式下查询/更新/删除必须使用 `whereId()`
  :::

#### select()

指定要返回的字段。

```typescript
select<S extends DbSelect<T>>(fields: S): Db<T, S>
```

::: warning

- `select()` 只能调用一次，重复调用会抛出错误
- 不再自动补充 `_id` 字段，若需要 `_id` 必须显式指定 `{ _id: true }`
  :::

**示例**

```typescript
// 只返回 name 和 age，不包含 _id
const user = await users.select({ name: true, age: true }).firstOrThrow();

// 显式包含 _id
const user = await users.select({ _id: true, name: true, age: true }).firstOrThrow();

// 返回所有字段（空对象）
const user = await users.select({}).firstOrThrow();

// 排除 _id，返回其他所有字段
const user = await users.select({ _id: false }).firstOrThrow();
```

#### order()

设置排序规则。

```typescript
order(order: DbOrder<T>): Db<T>
```

::: warning

- 事务模式下不允许调用 `order()`
  :::

#### skip()

跳过指定数量的记录。

```typescript
skip(skip: number): Db<T>
```

::: warning

- `skip()` 只能调用一次，重复调用会抛出错误
- 事务模式下不允许调用 `skip()`
  :::

#### limit()

限制返回的记录数量。

```typescript
limit(limit: number): Db<T>
```

::: warning

- `limit()` 只能调用一次，重复调用会抛出错误
- `limit()` 不能与 `whereId()` 同时调用
- `limit()` 不能与 `sample()` 同时使用（两者互斥）
- 事务模式下不允许调用 `limit()`
  :::

#### sample()

随机从文档中选取指定数量的记录。底层使用 MongoDB `$sample` 聚合阶段，直接从文档中随机采样指定数量的记录。

```typescript
sample(size: number): Db<T>
```

**参数**

| 参数 | 类型     | 描述             |
| ---- | -------- | ---------------- |
| size | `number` | 要选取的记录数量 |

**返回值**

`Db<T>` - 当前数据库实例，支持链式调用

::: warning

- `sample()` 只能调用一次，重复调用会抛出错误
- `sample()` 与 `limit()` 互斥，不能同时使用
- `sample()` 依赖聚合管线，`many()` 执行时会自动切换为聚合查询
- 事务模式下不允许调用 `sample()`
  :::

**示例**

```typescript
// 随机选取 5 条记录
const luckyUsers = await users.sample(5).many();

// 随机选取 1 名幸运用户
const luckyUser = await users.sample(1).firstOrThrow();

// 随机选取 1 名用户，无结果返回 null
const maybeUser = await users.sample(1).firstOrNull();

// 先筛选再随机选取：从活跃用户中随机选 10 个
const activeUsers = await users.where({ status: 'active' }).sample(10).many();

// 排序后随机选取：按创建时间降序排列后随机选 5 个
const recentUsers = await users.order({ createdAt: 'desc' }).sample(5).many();

// 跳过前 100 条后随机选取
const users = await users.skip(100).sample(5).many();
```

#### lookup()

关联查询。支持多层嵌套关联，每个 lookup 返回新的 Db 实例用于链式调用。

```typescript
lookup<FD1, FS1, FD2, FW2, RL extends DbRelation, AS extends string>(
  table: Db<FD1, FS1, FD2, FW2>,
  options: DbLookupOptions<RL, T, FD1, AS>
): Db<T, S1, D2 & DbForeign<FD1, FS1, FD2, RL, AS>>
```

**参数**

| 参数    | 类型                              | 描述                          |
| ------- | --------------------------------- | ----------------------------- |
| table   | `Db<FD1, FS1, FD2, FW2>`          | 关联表（可预先 select/where） |
| options | `DbLookupOptions<RL, T, FD1, AS>` | 关联配置                      |

**关联关系类型**

| 类型    | 描述       | 返回值                           |
| ------- | ---------- | -------------------------------- |
| `'1:1'` | 一对一关联 | 单个对象（见下方 nullable 规则） |
| `'1:n'` | 一对多关联 | 数组                             |
| `'n:1'` | 多对一关联 | 数组                             |

**1:1 关联 nullable 规则**

对于 `1:1` 关联，返回值是否为 `null` 取决于 `localField`：

| 场景             | localField           | 返回值                          |
| ---------------- | -------------------- | ------------------------------- |
| 主键关联         | `_id`                | `T \| null`（关联表不一定存在） |
| 外键关联（可选） | `teacherId?: string` | `T \| null`（外键可能为空）     |
| 外键关联（必填） | `teacherId: string`  | `T`（外键有值，关联表一定存在） |

```typescript
// 主键关联：student._id → StudentMeta.studentId
// StudentMeta 不一定存在，返回 T | null
const result = await studentTable
  .lookup(studentMetaTable, {
    relation: '1:1',
    localField: '_id',
    foreignField: 'studentId',
    as: 'meta',
  })
  .firstOrThrow();
// result.meta: StudentMeta | null

// 外键关联（可选）：student.teacherId → Teacher._id
// teacherId 是可选的，返回 T | null
const result = await studentTable
  .lookup(teacherTable, {
    relation: '1:1',
    localField: 'teacherId',
    foreignField: '_id',
    as: 'teacher',
  })
  .firstOrThrow();
// result.teacher: Teacher | null

// 外键关联（必填）：student.teacherId → Teacher._id
// teacherId 是必填的，返回 T
const result = await studentTable
  .lookup(teacherTable, {
    relation: '1:1',
    localField: 'teacherId',
    foreignField: '_id',
    as: 'teacher',
  })
  .firstOrThrow();
// result.teacher: Teacher
```

**示例**

```typescript
// 基础关联：用户关联其所有文章
const user = await userTable
  .lookup(postTable.select({ title: true, content: true }), {
    localField: '_id',
    foreignField: 'authorId',
    relation: '1:n',
    as: 'posts',
  })
  .firstOrThrow();

// 多层嵌套关联：用户 -> 文章 -> 评论 + 标签，同时关联用户资料
const user = await userTable
  .lookup(
    postTable
      .select({ title: true })
      .lookup(commentTable.select({ content: true, likes: true }), {
        as: 'comments',
        relation: '1:n',
        localField: '_id',
        foreignField: 'postId',
      })
      .lookup(tagTable.select({ name: true }), {
        as: 'tags',
        relation: 'n:1',
        localField: 'tagId',
        foreignField: '_id',
      }),
    { relation: '1:n', localField: '_id', foreignField: 'authorId', as: 'postList' },
  )
  .lookup(userProfile.select({ avatar: true, bio: true }), {
    relation: '1:1',
    localField: '_id',
    foreignField: 'userId',
    as: 'profile',
  })
  .firstOrThrow();

// 结果类型推断：
// {
//   _id: string;
//   nickname: string;
//   postList: {
//     _id: string;
//     title: string;
//     comments: { _id: string; content: string; likes: number }[];
//     tags: { _id: string; name: string }[];
//   }[];
//   profile: { _id: string; avatar: string; bio: string };
// }

// 使用 unselect 排除关联字段，结合 dbQuery.size() 查询无关联数据的记录
const booksWithoutReaders = await bookTable
  .lookup(userBookTable.where({ readerId: '123' }), {
    localField: '_id',
    foreignField: 'bookId',
    relation: '1:1',
    as: 'book2',
    unselect: true, // 结果中不包含 book2 字段
  })
  .where({ book2: dbQuery.size(0) }) // 查找没有被该读者关联的书
  .many();
```

#### group()

按指定字段分组聚合。底层使用 MongoDB `$group` 聚合阶段，累加器通过 `db.dbGroup` 命令对象构建。`group()` 返回类型完全由类型系统推断：累加器字段的类型会精确反推到结果中（不再退化为 `unknown`）。

```typescript
group<const K extends keyof T, const A extends Record<string, DbGroupCommand>>(
  field: K | readonly K[],
  accumulators: A,
): Db<T & { [P in keyof A]: A[P] extends DbGroupCommand<infer V> ? V : unknown }>
```

**参数**

| 参数         | 类型                             | 描述                                                           |
| ------------ | -------------------------------- | -------------------------------------------------------------- |
| field        | `K \| readonly K[]`              | 分组字段，单个字段传字段名、多个字段传数组（按多字段组合分组） |
| accumulators | `Record<string, DbGroupCommand>` | 累加器定义对象，value 使用 `db.dbGroup` 工厂方法构造的命令对象 |

**支持的累加器（详见 `db.dbGroup`）**

| 累加器方法          | 返回值字段类型 | 描述                           |
| ------------------- | -------------- | ------------------------------ |
| `sum(1)`            | `number`       | 计数模式：每条记录 +1          |
| `sum('field')`      | `number`       | 求和模式：对指定字段值求和     |
| `avg('field')`      | `number`       | 字段平均值                     |
| `min('field')`      | `T[K]`         | 字段最小值                     |
| `max('field')`      | `T[K]`         | 字段最大值                     |
| `push('field')`     | `T[K][]`       | 将字段值收集为数组（保留重复） |
| `addToSet('field')` | `T[K][]`       | 将字段值收集为数组（去重）     |
| `first('field')`    | `T[K]`         | 每组第一条记录的字段值         |
| `last('field')`     | `T[K]`         | 每组最后一条记录的字段值       |

::: warning

- `group()` 只能调用一次，重复调用会抛出错误
- `group()` 与 `select()` 互斥，不能同时使用
- `group()` 与 `sample()` 互斥，不能同时使用
- `group()` 与 `lookup()` 互斥，不能同时使用
- `group()` 不支持事务模式，事务中调用会抛出错误
- `group()` 不支持 `count()`、`create()`、`update()`、`remove()` 终端方法（这些方法内部会拒绝 `group` 条件）
- `group()` 依赖聚合管线，`many()` 执行时会自动切换为聚合查询
  :::

**示例**

```typescript
interface Order {
  _id: string;
  userId: string;
  amount: number;
  category: string;
  item: string;
  tag: string;
}

const orders = dbProxy<Order>('orders');

// 1. 按单字段分组计数
const orderCounts = await orders.group('userId', { count: orders.dbGroup.sum(1) }).many();
// orderCounts: { _id: string; userId: string; amount: number; category: string; item: string; tag: string; count: number }[]

// 2. 按字段求和
const totals = await orders.group('userId', { total: orders.dbGroup.sum('amount') }).many();
// totals[0].total: number

// 3. 按多字段组合分组
const monthlyStats = await orders.group(['category'], { total: orders.dbGroup.sum('amount') }).many();
// monthlyStats[0]._id: string（category 字段值）

// 4. avg / min / max 统计
const stats = await orders
  .group('category', {
    avgAmount: orders.dbGroup.avg('amount'),
    minAmount: orders.dbGroup.min('amount'),
    maxAmount: orders.dbGroup.max('amount'),
  })
  .many();
// stats[0].avgAmount: number
// stats[0].minAmount: number
// stats[0].maxAmount: number

// 5. 数组收集（push / addToSet / first / last）
const arrays = await orders
  .group('category', {
    items: orders.dbGroup.push('item'),
    tags: orders.dbGroup.addToSet('tag'),
    firstItem: orders.dbGroup.first('item'),
    lastItem: orders.dbGroup.last('item'),
  })
  .many();
// arrays[0].items: string[]
// arrays[0].tags: string[]
// arrays[0].firstItem: string
// arrays[0].lastItem: string

// 6. where + group 组合：先筛选再分组
const filtered = await orders
  .where({ amount: dbQuery.gt(100) })
  .group('category', { total: orders.dbGroup.sum('amount') })
  .many();

// 7. group + order 组合：分组后排序
const sorted = await orders
  .group('category', { total: orders.dbGroup.sum('amount') })
  .order({ total: 'desc' })
  .many();

// 8. firstOrThrow / firstOrNull
const first = await orders.group('category', { total: orders.dbGroup.sum('amount') }).firstOrThrow();
const maybe = await orders.group('category', { total: orders.dbGroup.sum('amount') }).firstOrNull();
```

**类型推断示例**

```typescript
interface Order {
  _id: string;
  userId: string;
  amount: number;
  item: string;
}

// sum('amount') 反推为 number
const r1 = await orders.group('userId', { total: orders.dbGroup.sum('amount') }).firstOrThrow();
// r1: { _id: string; userId: string; amount: number; item: string; total: number }

// push('item') 反推为 string[]
const r2 = await orders.group('userId', { items: orders.dbGroup.push('item') }).firstOrThrow();
// r2: { _id: string; userId: string; amount: number; item: string; items: string[] }

// push('amount') 反推为 number[]（与字段类型强绑定）
const r3 = await orders.group('userId', { amounts: orders.dbGroup.push('amount') }).firstOrThrow();
// r3: { _id: string; userId: string; amount: number; item: string; amounts: number[] }
```

#### 辅助方法与属性

以下方法和属性用于获取 Db 实例状态或创建新实例。

##### clone()

创建一个新的 Db 实例，继承当前实例的所有配置（表名、事务、错误处理等）。

```typescript
clone(withoutTransaction?: boolean): Db<D1, S1, D2, W2>
```

**参数**

| 参数               | 类型      | 默认值  | 描述               |
| ------------------ | --------- | ------- | ------------------ |
| withoutTransaction | `boolean` | `false` | 是否移除事务上下文 |

**返回值**

`Db<D1, S1, D2, W2>` - 新的数据库实例

**示例**

```typescript
const db = dbProxy<User>('users');
const cloned = db.clone();
// cloned 是独立实例，链式状态不共享

// 在事务中使用时，可以克隆一个非事务实例用于独立查询
const transDb = wt(db);
const queryDb = transDb.clone(true); // 移除事务，用于独立查询
```

##### getWhere()

获取当前查询条件对象。

```typescript
getWhere(plain?: boolean): DbWhere<D1>
```

**参数**

| 参数  | 类型      | 默认值  | 描述                                           |
| ----- | --------- | ------- | ---------------------------------------------- |
| plain | `boolean` | `false` | 是否返回原始查询条件（不包含 lookup 映射字段） |

**返回值**

`DbWhere<D1>` - 当前查询条件对象

**示例**

```typescript
const db = dbProxy<User>('users').where({ age: 18 });
const where = db.getWhere();
// { age: 18 }

// 在 dbPaging 中用于获取原始查询条件
const where = queryDb.getWhere(true);
```

##### aggregate()

获取聚合操作实例，用于构建 MongoDB 聚合管道。

```typescript
aggregate(): UniCloud.AggregatePipeline
```

**返回值**

`UniCloud.AggregatePipeline` - 聚合管道实例

**示例**

```typescript
const db = dbProxy<User>('users');
const agg = db.aggregate();
// 可以使用 agg.match(), agg.group(), agg.project() 等聚合方法
```

##### table (getter)

获取当前数据表名称。

```typescript
get table(): string
```

**示例**

```typescript
const db = dbProxy<User>('users');
console.log(db.table); // 'users'
```

##### options (getter)

获取当前 Db 实例的配置选项。

```typescript
get options(): DbOptions
```

**示例**

```typescript
const db = dbProxy<User>('users');
console.log(db.options.table); // 'users'
console.log(db.options.parseError); // 自定义错误处理函数（如有，接收 DbError 返回自定义 Error）
```

##### hasLookup (getter)

判断当前实例是否已配置 lookup 关联查询。

```typescript
get hasLookup(): boolean
```

**示例**

```typescript
const db1 = dbProxy<User>('users')
console.log(db1.hasLookup) // false

const db2 = db1.lookup(posts, { ... })
console.log(db2.hasLookup) // true
```

##### isTransaction (getter)

判断当前实例是否处于事务模式。

```typescript
get isTransaction(): boolean
```

**示例**

```typescript
const db = dbProxy<User>('users');
console.log(db.isTransaction); // false

await dbTransaction(async (wt) => {
  const transDb = wt(db);
  console.log(transDb.isTransaction); // true
});
```

##### dbGroup (getter)

获取分组聚合累加器命令工厂。返回的对象提供 8 种累加器方法，用于在 `group()` 中构建分组聚合条件。**与 `dbQuery`/`dbMutate` 不同，`dbGroup` 是 Db 实例的 getter，不是顶层导入对象**——这样能基于 `T`（表数据类型）反推字段类型，累加器返回的 `DbGroupCommand<T[K]>` 会携带精确的值类型。

```typescript
get dbGroup(): {
  sum: (value: number | string) => DbGroupCommand<number>;
  avg: (field: keyof T & string) => DbGroupCommand<number>;
  min: <K extends keyof T>(field: K) => DbGroupCommand<T[K]>;
  max: <K extends keyof T>(field: K) => DbGroupCommand<T[K]>;
  push: <K extends keyof T>(field: K) => DbGroupCommand<T[K][]>;
  addToSet: <K extends keyof T>(field: K) => DbGroupCommand<T[K][]>;
  first: <K extends keyof T>(field: K) => DbGroupCommand<T[K]>;
  last: <K extends keyof T>(field: K) => DbGroupCommand<T[K]>;
};
```

**累加器方法**

| 方法              | 参数                | 结果字段类型 | 描述                                   |
| ----------------- | ------------------- | ------------ | -------------------------------------- |
| `sum(value)`      | `number \| string`  | `number`     | 计数（传 `1`）或求和（传字段名字符串） |
| `avg(field)`      | `keyof T & string`  | `number`     | 字段平均值                             |
| `min(field)`      | `K extends keyof T` | `T[K]`       | 字段最小值（与字段类型强绑定）         |
| `max(field)`      | `K extends keyof T` | `T[K]`       | 字段最大值（与字段类型强绑定）         |
| `push(field)`     | `K extends keyof T` | `T[K][]`     | 收集为数组（保留重复）                 |
| `addToSet(field)` | `K extends keyof T` | `T[K][]`     | 收集为数组（自动去重）                 |
| `first(field)`    | `K extends keyof T` | `T[K]`       | 每组第一条记录的字段值                 |
| `last(field)`     | `K extends keyof T` | `T[K]`       | 每组最后一条记录的字段值               |

::: tip

`dbGroup` 只能用于 `group()` 方法的累加器对象中，单独调用 `dbGroup.X(...)` 不会执行任何操作。
:::

**类型反推示例**

```typescript
interface User {
  _id: string;
  name: string;
  age: number;
  active: boolean;
  createdAt: Date;
}

const users = dbProxy<User>('users');

// 字段类型反推：
const r1 = users.dbGroup.min('age'); // DbGroupCommand<number>
const r2 = users.dbGroup.first('name'); // DbGroupCommand<string>
const r3 = users.dbGroup.push('name'); // DbGroupCommand<string[]>
const r4 = users.dbGroup.first('active'); // DbGroupCommand<boolean>
const r5 = users.dbGroup.push('createdAt'); // DbGroupCommand<Date[]>

// sum 的两种模式：
users.dbGroup.sum(1); // 计数，返回 DbGroupCommand<number>
users.dbGroup.sum('age'); // 求和，返回 DbGroupCommand<number>
```

#### many()

执行查询，返回所有匹配记录。

```typescript
many(): Promise<DbQuery<T, S1, D2>[]>
```

#### firstOrThrow()

查询一条记录，无结果时抛出错误。

```typescript
firstOrThrow(): Promise<DbQuery<T, S1, D2>>
```

::: danger

- 不支持 `limit` 条件（`sample` 模式下可正常使用）
  :::

#### firstOrNull()

查询一条记录，无结果时返回 null。

```typescript
firstOrNull(): Promise<DbQuery<T, S1, D2> | null>
```

::: danger

- 不支持 `limit` 条件（`sample` 模式下可正常使用）
  :::

#### count()

获取匹配记录的数量。

```typescript
count(): Promise<number>
```

::: danger

- 不支持 `lookup` 聚合
- 不支持 `group` 分组
- 不支持 `select`、`order`、`skip`、`limit` 条件
  :::

#### create()

创建新记录。

```typescript
create(data: DbCreate<T>): Promise<string>
```

::: danger

- 不支持 `lookup` 聚合
- 不支持 `group` 分组
- 不支持 `where`、`select`、`order`、`skip`、`limit` 条件
  :::

#### update()

更新记录。

```typescript
update(data: DbUpdate<T>): Promise<number>
```

::: danger

- 不支持 `lookup` 聚合
- 不支持 `group` 分组
- 必须设置 `where` 条件后才能执行
- 不支持 `select`、`order`、`skip`、`limit` 条件
- 事务模式下必须使用 `whereId()` 设置条件
  :::

#### remove()

删除记录。

```typescript
remove(): Promise<number>
```

::: danger

- 不支持 `lookup` 聚合
- 不支持 `group` 分组
- 必须设置 `where` 条件后才能执行
- 不支持 `select`、`order`、`skip`、`limit` 条件
- 事务模式下必须使用 `whereId()` 设置条件
  :::

### dbUpsert

数据库 upsert 操作（存在则更新，不存在则创建）。

```typescript
function dbUpsert<D1, C extends DbCreate<D1>, U extends DbUpdate<D1>>(
  db: Db<D1>,
  options: DbUpsertOptions<D1, C, U>,
): Promise<DbUpsertOutput>;
```

**参数**

| 参数    | 类型                        | 描述       |
| ------- | --------------------------- | ---------- |
| db      | `Db<D1>`                    | 数据库实例 |
| options | `DbUpsertOptions<D1, C, U>` | 配置选项   |

**返回值**

`Promise<DbUpsertOutput>` - upsert 结果

**示例**

```typescript
// 基础用法：对象式更新
const result = await dbUpsert(users, {
  create: { name: 'Alice', age: 25 },
  update: { age: 26 },
  onBeforeCreate: () => {
    console.log('即将创建');
  },
  onAfterCreate: (id) => {
    console.log('创建完成:', id);
  },
});

console.log(result.id); // 文档 ID
console.log(result.created); // 是否是新创建的

// 函数式更新：根据已有数据动态计算更新内容
const result2 = await dbUpsert(users.where({ email: 'bob@example.com' }), {
  create: {
    nickname: 'Bob',
    email: 'bob@example.com',
    age: 20,
  },
  update(exist) {
    // exist 是查询到的已有文档
    return {
      age: exist.age + 1,
      nickname: `${exist.nickname}_updated`,
    };
  },
  onBeforeUpdate: (exist) => {
    // 返回 false 可取消更新
    if (exist.status === 'locked') return false;
  },
  onAfterUpdate: (updateData, exist) => {
    console.log('更新了:', updateData, '原始数据:', exist);
  },
});
```

### dbUnique

数据库唯一性检查并 upsert。

```typescript
function dbUnique<T, C extends DbCreate<T>>(db: Db<T>, options: DbUniqueOptions<T, C>): Promise<DbUniqueOutput>;
```

**参数**

| 参数    | 类型                    | 描述       |
| ------- | ----------------------- | ---------- |
| db      | `Db<T>`                 | 数据库实例 |
| options | `DbUniqueOptions<T, C>` | 配置选项   |

**返回值**

`Promise<DbUniqueOutput>` - 操作结果

**示例**

```typescript
// 确保邮箱唯一：不存在则创建，已存在则不做任何操作
const result = await dbUnique(users.where({ email: 'alice@example.com' }), {
  create: { name: 'Alice', email: 'alice@example.com', age: 25 },
  onBeforeCreate: () => {
    console.log('即将创建新用户');
  },
  onAfterCreate: (id) => {
    console.log('新用户创建成功:', id);
  },
});

console.log(result.id); // 文档 ID
console.log(result.created); // true=新创建, false=已存在
```

### dbTransaction

数据库事务。

```typescript
function dbTransaction<K>(
  transacting: (withTransaction: WithTransaction) => Promise<K>,
  _mockDatabase?: any,
  _mockDbInstance?: any,
): Promise<K>;
```

**参数**

| 参数        | 类型                                               | 描述     |
| ----------- | -------------------------------------------------- | -------- |
| transacting | `(withTransaction: WithTransaction) => Promise<K>` | 事务函数 |

**返回值**

`Promise<K>` - 事务结果

**示例**

```typescript
const users = dbProxy<User>('users');
const orders = dbProxy<Order>('orders');

// 基础事务操作
await dbTransaction(async (withTransaction) => {
  const transUsers = withTransaction(users);
  const transOrders = withTransaction(orders);

  // 在事务中操作
  await transUsers.whereId('123').update({ balance: dbMutate.inc(-100) });
  await transOrders.create({ userId: '123', amount: 100 });
});

// 事务中查询并返回结果
const result = await dbTransaction(async (withTransaction) => {
  const user = await withTransaction(users).select({}).firstOrThrow();
  // 非事务表也可以正常查询（不在事务中）
  const post = await postTable.select({}).firstOrThrow();

  return { user, post };
});
// result.user.age.toFixed()
// result.post.title.charAt(0)

// 事务中创建多条数据，失败自动回滚
await dbTransaction(async (wt) => {
  const userId = await wt(users).create({ name: 'John', age: 30 });
  await wt(orders).create({ userId, amount: 100 });
  await wt(orders).create({ userId, amount: 200 });
  // 如果任何一步失败，所有操作都会回滚
});
```

::: danger
以下 Db 实例方法**不支持事务模式**，在事务中调用会抛出错误：

- `group()`（依赖聚合管线，事务中无法保证一致性）
  :::

### dbPaging

数据库分页查询。

```typescript
function dbPaging<D1, S1 extends DbSelect<D1> = {}, D2 extends AnyObject = {}, W2 extends AnyObject = {}>(
  queryDb: Db<D1, S1, D2, W2>,
): Promise<{ list: DbQuery<D1, S1, D2>[]; total: number }>;
```

**参数**

| 参数    | 类型                 | 描述                                               |
| ------- | -------------------- | -------------------------------------------------- |
| queryDb | `Db<D1, S1, D2, W2>` | 数据库查询实例（已设置 where、order、skip、limit） |

**返回值**

`Promise<{ list: DbQuery<D1, S1, D2>[]; total: number }>` - 分页结果

**示例**

```typescript
// 基础分页
const { list, total } = await dbPaging(
  users
    .where({ age: dbQuery.gte(18) })
    .order({ createdAt: 'desc' })
    .skip(0)
    .limit(10),
);

console.log(list); // 当前页数据
console.log(total); // 总数

// 分页 + 关联查询
const result = await dbPaging(
  userTable
    .select({ _id: true, nickname: true, age: true })
    .where({ age: dbQuery.gt(18) })
    .lookup(postTable.select({ title: true }), {
      as: 'posts',
      relation: '1:n',
      localField: '_id',
      foreignField: 'authorId',
    })
    .order({ createdAt: 'desc' })
    .skip(0)
    .limit(10),
);

// 结果类型推断：
// {
//   list: {
//     _id: string;
//     nickname: string;
//     age: number;
//     posts: { title: string }[];
//   }[];
//   total: number;
// }

result.list[0]._id.charAt(0);
result.list[0].posts[0].title.charAt(0);
```

### dbEach

遍历表中的每一行数据并执行回调函数。采用分批查询策略，每批查询 100 条记录，通过 skip/limit 实现分页遍历，避免一次性加载大量数据导致内存溢出。迭代器按顺序串行执行。

```typescript
function dbEach<T>(
  table: Db<T>,
  where: DbWhere<T>,
  iterator: (row: T) => Promise<unknown>,
  maxCount?: number,
): Promise<void>;
```

**参数**

| 参数     | 类型                           | 描述                                             |
| -------- | ------------------------------ | ------------------------------------------------ |
| table    | `Db<T>`                        | 数据库表代理对象                                 |
| where    | `DbWhere<T>`                   | 查询条件                                         |
| iterator | `(row: T) => Promise<unknown>` | 对每一行数据执行的异步迭代器函数                 |
| maxCount | `number`                       | 最大遍历数量，默认值为 `Number.MAX_SAFE_INTEGER` |

::: warning
由于分批查询机制（每批 100 条），实际遍历的行数可能略大于 `maxCount`。例如 `maxCount=150` 时，会分两批查询（0-99、100-199），实际遍历 200 行。
:::

**示例**

```typescript
// 遍历所有状态为 active 的用户
await dbEach(users, { status: 'active' }, async (user) => {
  await sendEmail(user.email);
});

// 限制最多遍历 500 条记录
await dbEach(
  orders,
  { status: 'pending' },
  async (order) => {
    await processOrder(order);
  },
  500,
);

// 遍历并更新每条记录
await dbEach(users, { role: 'guest' }, async (user) => {
  await users.whereId(user._id).update({ role: 'user' });
});
```

### parseDatabaseOutput

解析数据库输出。

```typescript
function parseDatabaseOutput<T>(res: ClientDatabaseOutput<T> | CloudDatabaseOutput<T>): T;
```

**参数**

| 参数 | 类型                                                | 描述       |
| ---- | --------------------------------------------------- | ---------- |
| res  | `ClientDatabaseOutput<T> \| CloudDatabaseOutput<T>` | 数据库输出 |

**返回值**

`T` - 解析后的数据

**示例**

```typescript
// 云端环境：直接返回数据
const cloudRes = { data: { _id: '123', name: 'Alice' } };
const user1 = parseDatabaseOutput(cloudRes);
// user1 = { _id: '123', name: 'Alice' }

// 客户端环境：数据包裹在 result 中
const clientRes = { result: { errCode: 0, errMsg: 'ok', _id: '123', name: 'Alice' } };
const user2 = parseDatabaseOutput(clientRes);
// user2 = { _id: '123', name: 'Alice' }（自动去除 errCode/errMsg）

// 客户端错误：自动抛出 UniError
const errorRes = { result: { errCode: -1, errMsg: '记录不存在' } };
parseDatabaseOutput(errorRes); // 抛出错误
```
