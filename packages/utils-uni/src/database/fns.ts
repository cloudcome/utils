import { tryFlatten } from '@cloudcome/utils-core/try';
import { isFunction } from '@cloudcome/utils-core/type';
import type { AnyObject, MaybeCallable } from '@cloudcome/utils-core/types';
import { Db, type DbCreate, type DbProxy, type DbQuery, type DbSelect, type DbUpdate, type DbWhere, db } from './db';

export type DbUpsertOptions<T, S extends DbSelect<T>, C extends DbCreate<T>, U extends DbUpdate<T>> = {
  /** 查询条件 */
  where: DbWhere<T>;

  /** 查询返回字段 */
  select?: S;

  /** 创建数据 */
  create: C;

  /**
   * 更新数据，可以是对象或根据查询结果生成更新对象的函数
   * @param row 查询到的文档数据，仅在传入函数时可用
   */
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  update: U | ((existed: DbQuery<T, S, {}>) => U);

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
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  onBeforeUpdate?: (row: DbQuery<T, S, {}>) => unknown;

  /** 更新后回调函数 */
  onAfterUpdate?: () => unknown;

  /** 用于测试的模拟数据库实例 */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  _mockDbInstance?: any;
};

export async function dbUpsert<T, S extends DbSelect<T>, C extends DbCreate<T>, U extends DbUpdate<T>>(
  dbProxy: DbProxy<T, S, C>,
  options: DbUpsertOptions<T, S, C, U>,
) {
  const {
    where,
    select = {},
    create,
    update,
    onBeforeCreate,
    onAfterCreate,
    onBeforeUpdate,
    onAfterUpdate,
    _mockDbInstance,
  } = options;

  // @ts-ignore
  if ('_id' in select) throw new Error('select 条件不能包含 _id 字段');

  const _db = (_mockDbInstance || dbProxy) as DbProxy<T, S>;
  const existed = (await _db
    .where(where)
    .select(select || {})
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    .queryOne(true)) as DbQuery<T, S, {}> | undefined;

  if (existed) {
    await onBeforeUpdate?.(existed);
    const updateData = isFunction(update) ? update(existed) : update;
    // @ts-ignore
    const updated = await _db().whereId(existed._id).update(updateData);
    onAfterUpdate?.();

    // @ts-ignore
    return { id: existed._id as string, updated: true, created: false };
  }

  await onBeforeCreate?.();
  const createdId = await _db.create(create);
  await onAfterCreate?.(createdId);

  return { id: createdId, updated: false, created: true };
}

type _TransactionDb = {
  startTransaction: () => Promise<_Transaction>;
};

type _Transaction = {
  commit: () => Promise<unknown>;
  rollback: () => Promise<unknown>;
};

type _WithTransaction = <T, S extends DbSelect<T>, R extends AnyObject>(table: DbProxy<T, S, R>) => Db<T, S, R>;

/**
 * 在数据库事务中执行操作
 *
 * @template T - 事务操作返回值类型
 * @param transacting - 事务执行函数，接收事务数据库实例作为参数
 * @param _mockDatabase - 用于测试的模拟数据库对象
 * @param _mockDbInstance - 用于测试的模拟数据库实例
 * @returns 事务操作的返回结果
 *
 * @example
 * ```typescript
 * const result = await dbTransaction(async (withTransaction) => {
 *   const userId = await withTransaction(db.table('user')).create({ name: 'John' });
 *   const order = await withTransaction(db.table('orders')).create({ userId, amount: 100 });
 *   return { user, order };
 * });
 * ```
 */
export async function dbTransaction<K>(
  transacting: (withTransaction: _WithTransaction) => Promise<K>,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  _mockDatabase?: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  _mockDbInstance?: any,
) {
  const transactionDb = (_mockDatabase || uniCloud.database()) as _TransactionDb;

  const [err1, transaction] = await tryFlatten(transactionDb.startTransaction());
  if (err1) throw err1;

  const withTransaction = <T, S extends DbSelect<T>, R extends AnyObject>(dbProxy: DbProxy<T, S, R>) => {
    return _mockDbInstance || new Db<T, S, R>({ table: dbProxy.table, transaction });
  };

  const [err2, result] = await tryFlatten(async () => {
    const result = await transacting(withTransaction);
    await transaction.commit();
    return result;
  });

  if (err2) {
    await tryFlatten(transaction.rollback());
    throw err2;
  }

  return result as unknown as K;
}
