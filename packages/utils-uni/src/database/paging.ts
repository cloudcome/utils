import type { AnyObject } from '@cloudcome/utils-core/types';
import type { Db } from './_db.class';
import type { DbSelect } from './types';

/**
 * 数据库分页查询函数
 * @template T - 数据类型
 * @param queryDb - 数据库查询实例
 * @returns 包含数据列表和总数的对象
 */

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export async function dbPaging<D1, S1 extends DbSelect<D1> = {}, D2 extends AnyObject = {}, W2 extends AnyObject = {}>(
  queryDb: Db<D1, S1, D2, W2>,
) {
  // 获取原始查询条件，不包映射字段
  const where = queryDb.getWhere(true);

  // 克隆查询实例用于统计总数，避免影响原查询
  const countDb = queryDb.clone();

  // 执行查询获取数据列表
  const list = await queryDb.query();

  // 基于相同查询条件统计总数
  const total = await countDb.where(where).count();

  // 返回分页结果
  return {
    list,
    total,
  };
}
