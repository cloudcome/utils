import { isFunction } from '@cloudcome/utils-core/type';
import type { Exact } from '@cloudcome/utils-core/types';
import type { DbCreate, DbQuery, DbSelect, DbUpdate, DbWhere } from './_db.class';
import type { DbProxy } from './proxy';

export type DbUpsertOptions<T, S extends DbSelect<T>, C extends DbCreate<T>, U extends DbUpdate<T>> = {
  /** 查询条件 */
  where: DbWhere<T>;

  /** 查询返回字段 */
  select?: Exact<S, DbSelect<T>>;

  /** 创建数据 */
  create: C;

  /**
   * 更新数据，可以是对象或根据查询结果生成更新对象的函数
   * @param row 查询到的文档数据，仅在传入函数时可用
   */
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  update: U | ((exist: DbQuery<T, S, {}>) => U);

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
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  onBeforeUpdate?: (exist: DbQuery<T, S, {}>) => false | unknown;

  /**
   * 更新后回调函数
   * @param updateData 实际更新的数据
   * @param exist 查询到的原始文档数据
   */
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  onAfterUpdate?: (updateData: U, exist: DbQuery<T, S, {}>) => unknown;

  /** 用于测试的模拟数据库实例 */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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

export async function dbUpsert<D1, S1 extends DbSelect<D1>, C extends DbCreate<D1>, U extends DbUpdate<D1>>(
  dbProxy: DbProxy<D1>,
  options: DbUpsertOptions<D1, S1, C, U>,
): Promise<DbUpsertOutput> {
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

  const _db = (_mockDbInstance || dbProxy) as DbProxy<D1>;
  const exist = (await _db
    .where(where)
    .select(select || {})
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    .queryOne(true)) as DbQuery<D1, S1, {}> | null;

  if (exist) {
    const skipUpdate = (await onBeforeUpdate?.(exist)) === false;

    if (skipUpdate) {
      // @ts-ignore
      return { id: exist._id as string, updated: false, created: false };
    }

    const updateData = isFunction(update) ? update(exist) : update;
    // @ts-ignore
    const updated = await _db.whereId(exist._id).update(updateData);
    onAfterUpdate?.(updateData, exist);

    // @ts-ignore
    return { id: exist._id as string, updated: true, created: false };
  }

  await onBeforeCreate?.();
  const createdId = await _db.create(create);
  await onAfterCreate?.(createdId);

  return { id: createdId, updated: false, created: true };
}
