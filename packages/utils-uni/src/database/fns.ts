import { tryFlatten } from '@cloudcome/utils-core/try';
import { isFunction } from '@cloudcome/utils-core/type';
import type { AnyObject, MaybeCallable } from '@cloudcome/utils-core/types';
import { Db, type DbSelect, db } from './db';

/**
 * 数据库 upsert 操作的配置选项
 *
 * @template W - 查询条件类型
 * @template S - 查询返回字段类型
 * @template C - 创建数据类型
 * @template U - 更新数据类型
 * @template R - 查询结果类型
 */
export type DbUpsertOptions<
  W extends AnyObject,
  S extends DbSelect,
  C extends AnyObject,
  U extends AnyObject,
  R extends AnyObject,
> = {
  /** 集合名称 */
  collection: string;

  /** 查询条件 */
  where: W;

  /** 查询返回字段 */
  select?: S;

  /** 创建数据 */
  create: C;

  /**
   * 更新数据，可以是对象或根据查询结果生成更新对象的函数
   * @param row 查询到的文档数据，仅在传入函数时可用
   */
  update: U | ((row: R) => U);

  /** 创建前回调函数 */
  onBeforeCreate?: () => unknown;

  /**
   * 创建后回调函数
   * @param id 创建的文档ID
   */
  onAfterCreate?: (id: string) => unknown;

  /**
   * 更新前回调函数
   * @param row 查询到的文档
   */
  onBeforeUpdate?: (row: R) => unknown;

  /** 更新后回调函数 */
  onAfterUpdate?: () => unknown;

  /** 用于测试的模拟数据库实例 */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  _mockDb?: (collection: string) => any;
};

export async function dbUpsert<
  W extends AnyObject,
  S extends DbSelect,
  C extends AnyObject,
  U extends AnyObject,
  R extends AnyObject,
>(options: DbUpsertOptions<W, S, C, U, R>) {
  const { collection, where, create, update, onBeforeCreate, onAfterCreate, onBeforeUpdate, onAfterUpdate, _mockDb } =
    options;
  const _db = () => (_mockDb?.(collection) || db.collection(collection)) as Db;
  const found = await _db().where(where).limit(1).queryOne<R>(true);

  if (found) {
    await onBeforeUpdate?.(found);
    const updateData = isFunction(update) ? update(found) : update;
    const updated = await _db().where({ _id: found._id }).update(updateData);
    onAfterUpdate?.();

    return updated;
  }

  await onBeforeCreate?.();
  const created = await _db().create(create);
  await onAfterCreate?.(created.id);

  return created;
}

type _TransactionDb = {
  startTransaction: () => Promise<_Transaction>;
};

type _Transaction = {
  commit: () => Promise<unknown>;
  rollback: () => Promise<unknown>;
};

/**
 * 在数据库事务中执行操作
 *
 * @template T - 事务操作返回值类型
 * @param transact - 事务执行函数，接收事务数据库实例作为参数
 * @param _mockDatabase - 用于测试的模拟数据库实例
 * @returns 事务操作的返回结果
 *
 * @example
 * ```typescript
 * const result = await dbTransaction(async (ta) => {
 *   const user = await ta.collection('users').create({ name: 'John' });
 *   const order = await ta.collection('orders').create({ userId: user.id, amount: 100 });
 *   return { user, order };
 * });
 * ```
 */
export async function dbTransaction<T>(transact: (ta: Db) => Promise<T>, _mockDatabase?: _TransactionDb) {
  const db = (_mockDatabase || uniCloud.database()) as _TransactionDb;

  const [err1, transaction] = await tryFlatten(db.startTransaction());
  if (err1) throw err1;

  const ta = new Db({ collection: '', transaction });
  const [err2, result] = await tryFlatten(async () => {
    const result = await transact(ta);
    await transaction.commit();
    return result;
  });

  if (err2) {
    await tryFlatten(transaction.rollback());
    throw err2;
  }

  return result;
}
