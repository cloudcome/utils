import type { HasProperty, IsEmptyObject, IsOnlyProperty } from '@cloudcome/utils-core/types';
import type { UniErrorData } from '@/_types';
import type { DbMutateCommand, DbQueryCommand } from './_command.class';

/**
 * 客户端数据库输出类型
 * @template T - 原始数据类型
 */
export type ClientDatabaseOutput<T> = {
  result: T & UniErrorData;
};

/**
 * 云端数据库输出类型
 * @template T - 原始数据类型
 */
export type CloudDatabaseOutput<T> = T;

/** 数据库相关类型 */

/**
 * 数据库查询条件类型
 * @template T - 数据模型类型
 */
export type DbWhere<T> = {
  [K in keyof T]?: T[K] | DbQueryCommand;
};

/**
 * 数据库字段选择类型
 * @template T - 数据模型类型
 */
export type DbSelect<T> = {
  [K in keyof T]?: K extends '_id' ? boolean : true;
};

/**
 * 数据库默认字段类型
 * @template T - 数据模型类型
 */
export type DbFieldsDefault<T> = {
  [K in keyof T]: true;
};

/**
 * 判断是否只有 _id 字段的内部类型
 * @template D - 字段选择类型
 * @template V - 值类型
 */
type _OnlyFieldId<D, V> =
  IsOnlyProperty<D, '_id'> extends true ? ('_id' extends keyof D ? (D['_id'] extends V ? true : false) : false) : false;

/**
 * 数据库字段处理类型
 * @template D - 数据模型类型
 * @template S - 字段选择类型
 */
export type DbFields<D, S extends DbSelect<D>> =
  IsEmptyObject<S> extends true // 判断是否为空对象
    ? // 默认全部字段
      DbFieldsDefault<D>
    : // 判断 _id 是否为唯一属性 且 为 false
      _OnlyFieldId<S, false> extends true
      ? // 从默认字段里排除 _id
        Omit<DbFieldsDefault<D>, '_id'>
      : // 判断 _id 是否为唯一属性 且 为 true
        _OnlyFieldId<S, true> extends true
        ? // 只保留 _id
          { _id: true }
        : // 判断是否有 _id
          HasProperty<S, '_id'> extends true
          ? // 有的话保留 {_id, ...}
            S
          : // 没有的话补上 {_id, ...}
            S & { _id: true };

/**
 * 数据库查询结果类型
 * @template D1 - 主数据模型类型
 * @template S1 - 字段选择类型
 */
type _DbQuery<D1, S1 extends DbSelect<D1>> = {
  [K in keyof D1 as S1[K] extends true ? K : never]: D1[K];
};

/**
 * 数据库查询类型
 * @template D1 - 主数据模型类型
 * @template S1 - 字段选择类型
 * @template D2 - 关联数据模型类型
 */
export type DbQuery<D1, S1 extends DbSelect<D1>, D2> = _DbQuery<
  D1,
  // @ts-expect-error
  DbFields<D1, S1>
> &
  D2;

/**
 * 数据库关联类型
 * - '1:1': 一对一关联，返回值 1 个
 * - '1:n': 一对多关联，返回值 n 个
 * - 'n:1': 多对一关联，返回值 n 个
 */
export type DbRelation = '1:1' | '1:n' | 'n:1';

/**
 * 判断类型是否可能为 null 或 undefined
 */
type IsNullable<T> = null extends T ? true : undefined extends T ? true : false;

/**
 * 数据库外键关联类型
 * @template MainData - 主表数据类型（用于判断 localField 是否可选）
 * @template RelatedData - 关联表数据类型
 * @template RelatedSelect - 关联表字段选择类型
 * @template RelatedExtra - 关联表额外数据类型
 * @template RL - 关联关系类型
 * @template AS - 关联字段别名
 * @template LF - 主表关联字段名（用于判断是否可选）
 */
export type DbForeign<
  MainData,
  RelatedData,
  RelatedSelect extends DbSelect<RelatedData>,
  RelatedExtra,
  RL extends DbRelation,
  AS extends string,
  LF extends keyof MainData,
> = Record<
  AS,
  RL extends '1:1'
    ? IsNullable<MainData[LF]> extends true
      ? DbQuery<RelatedData, RelatedSelect, RelatedExtra> | null
      : DbQuery<RelatedData, RelatedSelect, RelatedExtra>
    : DbQuery<RelatedData, RelatedSelect, RelatedExtra>[]
>;

/**
 * 数据库创建数据类型
 * @template T - 数据模型类型
 */
export type DbCreate<T> = Omit<T, '_id'> & { _id?: string };

/**
 * 数据库更新数据类型
 * @template T - 数据模型类型
 */
export type DbUpdate<T> = T extends AnyObject
  ? {
      [K in keyof T]?: DbUpdate<T[K]> | DbMutateCommand;
    }
  : T;

/**
 * 数据库排序类型
 * @template T - 数据模型类型
 */
export type DbOrder<T> = {
  [K in keyof T]?: 'asc' | 'desc';
};
