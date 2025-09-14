import { isFunction } from '@cloudcome/utils-core/type';
import type { AnyObject, MaybeCallable } from '@cloudcome/utils-core/types';
import { Db, type DbSelect } from './db';

/**
 * 数据库操作对象
 */
export const db = {
  /**
   * 获取指定名称的数据库集合实例
   * @param collection 集合名称
   * @returns Db类实例，用于执行数据库操作
   */
  collection(collection: string) {
    return new Db(collection);
  },
};

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
