import type { Db } from './_db.class';
import type { DbWhere } from './types';

/**
 * 遍历表中的每一行数据并执行回调函数
 *
 * 采用分批查询策略，每批查询 100 条记录，通过 skip/limit 实现分页遍历，
 * 避免一次性加载大量数据导致内存溢出。
 *
 * 迭代器按顺序串行执行，即每一行数据的迭代器完成后才会处理下一行。
 *
 * @template T - 数据行类型
 * @param table 数据库表代理对象
 * @param where 查询条件
 * @param iterator 对每一行数据执行的异步迭代器函数
 * @param maxCount 最大遍历数量，默认值为 Number.MAX_SAFE_INTEGER。
 *   注意：由于分批查询机制（每批 100 条），实际遍历的行数可能略大于 maxCount，
 *   例如 maxCount=150 时，会分两批查询（0-99、100-199），实际遍历 200 行。
 * @example
 * ```ts
 * // 遍历所有状态为 active 的用户
 * await dbEach(userTable, { status: 'active' }, async (user) => {
 *   await sendEmail(user.email);
 * });
 *
 * // 限制最多遍历 500 条记录
 * await dbEach(orderTable, { status: 'pending' }, async (order) => {
 *   await processOrder(order);
 * }, 500);
 * ```
 */
export async function dbEach<T>(
  table: Db<T>,
  where: DbWhere<T>,
  iterator: (row: T) => Promise<unknown>,
  maxCount = Number.MAX_SAFE_INTEGER,
) {
  const count = Math.min(await table.where(where).count(), maxCount);
  const limit = 100;

  for (let skip = 0; skip < count; skip += limit) {
    const rows = await table.where(where).limit(limit).skip(skip).many();

    for (const row of rows) {
      await iterator(row as T);
    }
  }
}
