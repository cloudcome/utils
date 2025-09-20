import type { DbCreate, DbSelect, DbUpdate, DbWhere } from './db.class';
import type { DbProxy } from './proxy';
import { dbUpsert } from './upsert';

export type DbUniqueOptions<T, S extends DbSelect<T>, C extends DbCreate<T>, U extends DbUpdate<T>> = {
  /** 查询条件 */
  where: DbWhere<T>;

  /** 创建数据 */
  create: C;

  /** 创建前回调函数 */
  onBeforeCreate?: () => unknown;

  /**
   * 创建后回调函数
   * @param id 创建的文档ID
   */
  onAfterCreate?: (id: string) => unknown;

  /** 用于测试的模拟数据库实例 */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  _mockDbInstance?: any;
};

/**
 * 数据库 upsert 操作的返回结果类型
 */
export type DbUniqueOutput = {
  /** 操作的文档ID */
  id: string;
  /** 是否为创建操作 */
  created: boolean;
};

export function dbUnique<T, S extends DbSelect<T>, C extends DbCreate<T>, U extends DbUpdate<T>>(
  dbProxy: DbProxy<T>,
  options: DbUniqueOptions<T, S, C, U>,
): Promise<DbUniqueOutput> {
  return dbUpsert(dbProxy, {
    ...options,
    update: {},
    onBeforeUpdate: () => false,
  });
}
