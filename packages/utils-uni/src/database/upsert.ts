import { isFunction } from '@cloudcome/utils-core/type';
import type { Db } from './_db.class';
import type { DbCreate, DbQuery, DbUpdate } from './types';

export type DbUpsertOptions<T, C extends DbCreate<T>, U extends DbUpdate<T>> = {
  /** 创建数据 */
  create: C;

  /**
   * 更新数据，可以是对象或根据查询结果生成更新对象的函数
   * @param row 查询到的文档数据，仅在传入函数时可用
   */
  // biome-ignore lint/complexity/noBannedTypes: 必须这么用
  update: U | ((exist: DbQuery<T, {}, {}>) => U);

  /** 创建前回调函数 */
  onBeforeCreate?: () => unknown;

  /**
   * 创建后回调函数
   * @param id 创建的文档ID
   */
  onAfterCreate?: (id: string) => unknown;

  /**
   * 更新前回调函数
   * @param exist 查询到的原始文档数据
   * @returns 如果返回 false，则取消更新操作
   */
  // biome-ignore lint/complexity/noBannedTypes: 必须这么用
  onBeforeUpdate?: (exist: DbQuery<T, {}, {}>) => false | unknown;

  /**
   * 更新后回调函数
   * @param updateData 实际更新的数据
   * @param exist 查询到的原始文档数据
   */
  // biome-ignore lint/complexity/noBannedTypes: 必须这么用
  onAfterUpdate?: (updateData: U, exist: DbQuery<T, {}, {}>) => unknown;

  /** 用于测试的模拟数据库实例 */
  // biome-ignore lint/suspicious/noExplicitAny: 单测使用 any
  _mockDbInstance?: any;
};

/**
 * 数据库 upsert 操作的返回结果类型
 */
export type DbUpsertOutput = {
  /** 操作的文档ID */
  id: string;
  /** 是否为创建操作 */
  created: boolean;
  /** 是否为更新操作 */
  updated: boolean;
};

export async function dbUpsert<D1, C extends DbCreate<D1>, U extends DbUpdate<D1>>(
  db: Db<D1>,
  options: DbUpsertOptions<D1, C, U>,
): Promise<DbUpsertOutput> {
  const { create, update, onBeforeCreate, onAfterCreate, onBeforeUpdate, onAfterUpdate, _mockDbInstance } = options;

  const _mutateDb = (_mockDbInstance || db.clone()) as Db<D1>;
  const _queryDb = (_mockDbInstance || db.clone(true)) as Db<D1>;

  const exist = (await _queryDb
    .where(db.getWhere(true))
    // biome-ignore lint/complexity/noBannedTypes: 必须这么用
    .firstOrNull()) as DbQuery<D1, {}, {}> | null;

  if (exist) {
    const skipUpdate = (await onBeforeUpdate?.(exist)) === false;

    if (skipUpdate) {
      // @ts-expect-error
      return { id: exist._id as string, updated: false, created: false };
    }

    const updateData = isFunction(update) ? update(exist) : update;
    // @ts-expect-error
    await _mutateDb.whereId(exist._id).update(updateData);
    onAfterUpdate?.(updateData, exist);

    // @ts-expect-error
    return { id: exist._id as string, updated: true, created: false };
  }

  await onBeforeCreate?.();
  const createdId = await _mutateDb.create(create);
  await onAfterCreate?.(createdId);

  return { id: createdId, updated: false, created: true };
}
