import type { Db } from './_db.class';

/**
 * 数据库分页查询函数
 * @template T - 数据类型
 * @param queryDb - 数据库查询实例
 * @returns 包含数据列表和总数的对象
 */
export async function dbPaging<T>(queryDb: Db<T>) {
  // 获取查询条件
  const where = queryDb.getWhere();

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
