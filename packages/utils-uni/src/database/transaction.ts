import { tryFlatten } from '@cloudcome/utils-core/try';
import { Db } from './_db.class';
import type { DbProxy } from './proxy';

type _TransactionDb = {
  startTransaction: () => Promise<_Transaction>;
};

type _Transaction = {
  commit: () => Promise<unknown>;
  rollback: () => Promise<unknown>;
};

export type WithTransaction = <D1>(table: DbProxy<D1>) => Db<D1>;

/**
 * 在数据库事务中执行操作
 *
 * @template K - 事务操作返回值类型
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
  transacting: (withTransaction: WithTransaction) => Promise<K>,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  _mockDatabase?: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  _mockDbInstance?: any,
) {
  const transactionDb = (_mockDatabase || uniCloud.database()) as _TransactionDb;

  const [err1, transaction] = await tryFlatten(transactionDb.startTransaction());
  if (err1) throw err1;

  const withTransaction: WithTransaction = <D1>(dbProxy: DbProxy<D1>) => {
    return _mockDbInstance || new Db<D1>({ table: dbProxy.table, transaction });
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
