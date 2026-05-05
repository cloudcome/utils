import { parseDatabaseOutput } from '@/_helpers';
import type { UniError } from '@/_types';
import { createCloudObjectError } from '@/cloud';
import { objectEach, objectFilter, objectMap, objectOmit } from '@cloudcome/utils-core/object';
import { isArray, isNumber, isObject, isString } from '@cloudcome/utils-core/type';
import type { AnyObject, MergeIntersection } from '@cloudcome/utils-core/types';
import { DbBaseCommand, type DbQueryCommand } from './_command.class';
import type { DbCreate, DbForeign, DbOrder, DbQuery, DbRelation, DbSelect, DbUpdate, DbWhere } from './types';

/**
 * 数据库聚合操作符命令
 */
const dbAgg = uniCloud.database().command.aggregate as UniCloud.AggregateCommand & {
  pipeline: () => UniCloud.AggregateReference & {
    done: () => unknown;
  };
};

type _WhereFrom = 'where' | 'whereId';

const db0 = uniCloud.database();

export type DbOptions = {
  /**
   * 数据表名称
   */
  table: string;

  /**
   * 事务对象，用于事务操作
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  transaction?: any;

  /**
   * 模拟数据库，用于单元测试
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  _mockDatabase?: any;

  /**
   * 自定义错误处理函数
   * @param error 数据库错误对象
   * @returns 处理后的数据库错误对象
   */
  parseError?: (error: UniError) => UniError;
};

// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
export type DbLookupOptions<RL extends DbRelation, D1, FD1, AS, US extends boolean | undefined | void = undefined> = {
  /**
   * 关联类型
   */
  relation: RL;

  /**
   * 主表字段
   */
  localField: keyof D1 & string;

  /**
   * 关联表字段
   */
  foreignField: keyof FD1 & string;

  /**
   * 关联数据在结果中的字段名
   */
  as: AS;

  /**
   * 是否取消筛选关联数据
   */
  unselect?: US;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type DbLookup = DbLookupOptions<any, unknown, unknown, string, boolean> & {
  /**
   * 关联表
   */
  table: Db<unknown>;
};

let gid = 0;

/**
 * 数据库类
 * @template D1 - 主表数据
 * @template S1 - 主表筛选
 * @template D2 - 副表数据
 * @template W2 - 副表查询
 */
// biome-ignore lint/complexity/noBannedTypes: <explanation>
export class Db<D1, S1 extends DbSelect<D1> = {}, D2 extends AnyObject = {}, W2 extends AnyObject = {}> {
  private _host: UniCloud.CollectionReference;

  /**
   * 是否为事务环境
   * - 查询条件只能是 id
   * - 不能聚合操作
   */
  private _isTransaction = false;

  private _options: DbOptions;

  /**
   * 构造函数，初始化数据库集合引用
   * @param collection 数据表名称
   * @param _mockDatabase 模拟数据库，用于单元测试
   */
  constructor(options: DbOptions) {
    this._options = options;
    this._host =
      options._mockDatabase || options.transaction?.collection(options.table) || db0.collection(options.table);
    this._isTransaction = !!options.transaction;
  }

  /**
   * 创建一个新的数据库实例，可选是否移除事务
   * @param withoutTransaction 是否移除事务，默认 false
   * @returns 新的数据库实例
   */
  clone(withoutTransaction?: boolean) {
    return new Db({ ...this._options, transaction: withoutTransaction ? null : this._options.transaction });
  }

  get table() {
    return this._options.table;
  }

  get options() {
    return this._options;
  }

  get isTransaction() {
    return this._isTransaction;
  }

  /**
   * 获取聚合操作实例
   * @returns 聚合操作实例
   */
  aggregate() {
    return this._host.aggregate();
  }

  private _hasWhere: _WhereFrom | undefined = undefined;
  private _hasWhereId: _WhereFrom | undefined = undefined;
  private _where = {};

  private _doWhere(where: DbWhere<D1>, from: _WhereFrom) {
    if (this._hasWhere) throw new Error(`已调用过一次 db.${_toWhereMethod(this._hasWhere)} 了`);

    // 过滤掉值为 undefined 的键值对，数据库不支持查询全 undefined 值
    const realWhere = objectFilter(where, (value) => value !== undefined);

    const whereKeys = Object.keys(realWhere);

    // 只有 _id 值为字符串或数字时，才能调用 doc 方法
    const isWhereId =
      whereKeys.length === 1 && '_id' in realWhere && (isString(realWhere._id) || isNumber(realWhere._id));

    if (isWhereId && this._hasLimit) {
      throw new Error(`db.${_toWhereIdMethod(from)} 方法不能与 db.limit() 方法同时调用`);
    }

    this._hasWhere = from;
    this._where = realWhere;
    if (isWhereId) this._hasWhereId = from;

    return this;
  }

  /**
   * 设置查询条件
   * @param where 查询条件对象
   * @returns 当前Db实例，支持链式调用
   */
  where(where: DbWhere<D1> & W2) {
    return this._doWhere(where, 'where');
  }

  /**
   * 获取当前查询条件
   * @param plain 是否返回原始查询条件对象，默认 false
   * @returns 当前查询条件对象
   */
  getWhere(plain?: boolean) {
    // @ts-ignore
    return plain ? objectOmit(this._where, Object.keys(this._lookupAs)) : this._where;
  }

  /**
   * 根据ID设置查询条件
   * @param id 记录ID
   * @returns 当前Db实例，支持链式调用
   */
  whereId(id: string | number) {
    // @ts-ignore
    return this._doWhere({ _id: id }, 'whereId');
  }

  private _hasSelect = 0;
  private _select = {};

  /**
   * 指定要返回的字段
   * @param fields 要返回的字段对象，true表示返回，false表示不返回
   * @returns 当前Db实例，支持链式调用
   */
  select<const S extends DbSelect<D1>>(fields: S) {
    if (this._hasSelect) throw new Error('db.select() 方法只能调用一次');

    this._hasSelect++;
    this._select = fields;

    // @ts-ignore
    return this as Db<D1, S, D2, W2>;
  }

  private _hasOrder = 0;
  private _order = {};

  /**
   * 设置排序规则
   * @param order 排序规则对象，key为字段名，value为"asc"或"desc"
   * @returns 当前Db实例，支持链式调用
   */
  order(order: DbOrder<D1>) {
    this._hasOrder++;
    this._order = order;

    return this;
  }

  private _hasSkip = 0;
  private _skip = 0;

  /**
   * 跳过指定数量的记录
   * @param skip 要跳过的记录数
   * @returns 当前Db实例，支持链式调用
   */
  skip(skip: number) {
    if (this._hasSkip) throw new Error('db.skip() 方法只能调用一次');

    this._hasSkip++;
    this._skip = skip;

    return this;
  }

  private _hasLimit = 0;
  private _limit = 0;

  /**
   * 限制返回的记录数量
   * @param limit 最大返回记录数
   * @returns 当前Db实例，支持链式调用
   */
  limit(limit: number) {
    if (this._hasLimit) throw new Error('db.limit() 方法只能调用一次');

    if (this._hasWhereId) {
      throw new Error(`db.limit() 方法不能与 ${_toWhereIdMethod(this._hasWhereId)} 方法同时调用`);
    }

    this._hasLimit++;
    this._limit = limit;

    return this;
  }

  private _hasLookup = 0;
  get hasLookup() {
    return this._hasLookup > 0;
  }

  private _lookups: DbLookup[] = [];
  lookup<
    FD1,
    FS1 extends DbSelect<FD1>,
    FD2 extends AnyObject,
    FW2 extends AnyObject,
    RL extends DbRelation,
    AS extends string,
    // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
    US extends boolean | undefined | void = undefined,
  >(table: Db<FD1, FS1, FD2, FW2>, lookup: DbLookupOptions<RL, D1, FD1, AS, US>) {
    // 对方表也记为关联查询，避免做表更新操作
    table._hasLookup++;
    this._hasLookup++;
    this._lookups.push({
      ...lookup,
      table,
    } as unknown as DbLookup);

    // @ts-ignore
    return this as Db<
      D1,
      S1,
      US extends true ? D2 : MergeIntersection<D2 & DbForeign<FD1, FS1, FD2, RL, AS>>,
      MergeIntersection<W2 & Partial<Record<AS, DbQueryCommand>>>
    >;
  }

  private _aggregated = false;
  private _lookupAs = {} as Record<string, true>;
  private _endAggregate(aggRef: UniCloud.AggregateReference) {
    if (this._aggregated) throw new Error(`相同的数据表实例(${this.table})不能重复使用`);

    this._aggregated = true;
    let returnAggRef = aggRef;
    let hasAggSelect = 0;
    const aggSelect = {} as Record<string, true>;
    let hasAggUnselect = 0;
    const aggUnselect = {} as Record<string, false>;

    // 后做关联查询
    for (const { relation: type, as, foreignField, localField, table, unselect } of this._lookups) {
      const letName = `let${gid++}`;
      let pipeline = dbAgg.pipeline();

      // 关联条件
      // @ts-ignore
      pipeline = pipeline.match({
        $expr: {
          $and: [
            type === 'n:1'
              ? { $in: [`$${foreignField}`, `$$${letName}`] }
              : { $eq: [`$${foreignField}`, `$$${letName}`] },
          ],
        },
      });

      // 其他查询条件
      // @ts-ignore
      pipeline = table._endAggregate(pipeline);

      // @ts-ignore
      pipeline = pipeline.done();

      returnAggRef = returnAggRef.lookup({
        let: {
          [letName]: `$${localField}`,
        },
        as,
        from: table.table,
        pipeline,
      });

      // 1对1，展开数组
      if (type === '1:1') {
        // @ts-ignore
        returnAggRef = returnAggRef.unwind({
          path: `$${as}`,
          preserveNullAndEmptyArrays: true,
        });
      }

      if (unselect) {
        hasAggUnselect++;
        aggUnselect[as] = false;
      } else {
        hasAggSelect++;
        aggSelect[as] = true;
      }

      this._lookupAs[as] = true;
    }

    // 主表查询，注意顺序，筛选->排序->跳过->限制
    if (this._hasWhere) returnAggRef = returnAggRef.match(_mapCommandRaw(this._where));
    if (this._hasOrder) returnAggRef = returnAggRef.sort(objectMap(this._order, (v) => (v === 'asc' ? 1 : -1)));
    if (this._hasSkip) returnAggRef = returnAggRef.skip(this._skip);
    if (this._hasLimit) returnAggRef = returnAggRef.limit(this._limit);

    // 如果主表有选择字段，则合并选择字段（包括关联查询的字段和排序字段）
    if (this._hasSelect) {
      returnAggRef = returnAggRef.project(_mergeSelect({ ...this._select, ...aggSelect }, this._order));
    }
    // 如果主表没有选择字段，则排除取消选择字段
    else if (hasAggUnselect) {
      returnAggRef = returnAggRef.project(aggUnselect);
    }

    return returnAggRef;
  }

  private _endHost(action: 'query' | 'create' | 'update' | 'remove' | 'count') {
    if (this._hasWhere) {
      // 事务模式下：更新/删除只能用 doc(id)
      if ((action === 'update' || action === 'remove') && this._isTransaction) {
        // @ts-ignore
        this._host = this._host.doc(this._where._id);
      } else {
        // @ts-ignore
        this._host = this._host.where(_mapCommandRaw(this._where));
      }
    }

    if (this._hasSelect) {
      // @ts-ignore
      this._host = this._host.field(_mergeSelect(this._select, this._order));
    }

    if (this._hasOrder) {
      objectEach(this._order, (val, key) => {
        // @ts-ignore
        this._host = this._host.orderBy(key, val);
      });
    }

    // @ts-ignore
    if (this._hasSkip) this._host = this._host.skip(this._skip);

    // @ts-ignore
    if (this._hasLimit && action === 'query') this._host = this._host.limit(this._limit);
    // @ts-ignore
    else if (this._hasWhereId && action === 'query') this._host = this._host.limit(1);
  }

  /**
   * 执行查询操作
   * @returns 查询结果
   */
  async many() {
    try {
      if (this._isTransaction) throw new Error('db.many() 方法不支持事务模式');

      let res: { data: DbQuery<D1, S1, D2>[] };

      // 关联查询
      if (this._hasLookup) {
        const aggRef = this.aggregate();
        this._endAggregate(aggRef);
        res = await aggRef.end();
      }
      // 单表查询
      else {
        this._endHost('query');
        res = await this._host.get();
      }

      const { data } = parseDatabaseOutput(res);
      return data;
    } catch (err) {
      const dbErr = err as UniError;
      throw this._options.parseError?.(dbErr) || dbErr;
    }
  }

  /**
   * 只查询一条，自动添加 limit(1) 条件
   * 如果没有匹配到记录，会抛出错误
   * @returns 查询结果
   */
  async firstOrThrow(): Promise<DbQuery<D1, S1, D2>> {
    if (this._isTransaction) throw new Error('db.firstOrThrow() 方法不支持事务模式');
    if (this._hasLimit) throw new Error('db.firstOrThrow() 方法不支持 limit 条件');
    if (!this._hasWhereId) this.limit(1);

    const data = await this.many();
    const res = data.at(0);

    if (!res) throw createCloudObjectError('查询数据为空', 'firstOrThrow');
    return res;
  }

  /**
   * 只查询一条，自动添加 limit(1) 条件
   * 如果没有匹配到记录，返回 null
   * @returns 查询结果或 null
   */
  async firstOrNull(): Promise<DbQuery<D1, S1, D2> | null> {
    if (this._isTransaction) throw new Error('db.firstOrNull() 方法不支持事务模式');
    if (this._hasLimit) throw new Error('db.firstOrNull() 方法不支持 limit 条件');
    if (!this._hasWhereId) this.limit(1);

    const data = await this.many();
    return data.at(0) || null;
  }

  /**
   * 获取匹配记录的数量
   * @returns 记录总数
   */
  async count() {
    if (this._isTransaction) throw new Error('db.count() 方法不支持事务模式');
    if (this._hasLookup) throw new Error('db.count() 方法不支持 lookup 聚合');
    if (this._hasSelect) throw new Error('db.count() 方法不支持 select 条件');
    if (this._hasOrder) throw new Error('db.count() 方法不支持 order 条件');
    if (this._hasSkip) throw new Error('db.count() 方法不支持 skip 条件');
    if (this._hasLimit) throw new Error('db.count() 方法不支持 limit 条件');

    try {
      this._endHost('count');
      const res = await this._host.count();
      const { total } = parseDatabaseOutput<{ total: number }>(res);
      return total;
    } catch (err) {
      const dbErr = err as UniError;
      throw this._options.parseError?.(dbErr) || dbErr;
    }
  }

  /**
   * 创建新记录
   * @param data 要创建的数据
   * @returns 创建结果
   */
  async create(data: DbCreate<D1>) {
    if (this._hasLookup) throw new Error('db.create() 方法不支持 lookup 聚合');
    if (this._hasWhere) throw new Error('db.create() 方法不支持 where 条件');
    if (this._hasSelect) throw new Error('db.create() 方法不支持 select 条件');
    if (this._hasOrder) throw new Error('db.create() 方法不支持 order 条件');
    if (this._hasSkip) throw new Error('db.create() 方法不支持 skip 条件');
    if (this._hasLimit) throw new Error('db.create() 方法不支持 limit 条件');

    try {
      this._endHost('create');
      const res = await this._host.add(data);
      const { id } = parseDatabaseOutput<{ id: string }>(res);
      return id;
    } catch (err) {
      const dbErr = err as UniError;
      throw this._options.parseError?.(dbErr) || dbErr;
    }
  }

  /**
   * 更新记录
   * @param data 要更新的数据
   * @returns 更新结果
   */
  async update(data: DbUpdate<D1>) {
    if (this._hasLookup) throw new Error('db.update() 方法不支持 lookup 聚合');
    if (!this._hasWhere) throw new Error('设置 where 条件后才能执行 db.update() 方法');
    if (this._hasSelect) throw new Error('db.update() 方法不支持 select 条件');
    if (this._hasOrder) throw new Error('db.update() 方法不支持 order 条件');
    if (this._hasSkip) throw new Error('db.update() 方法不支持 skip 条件');
    if (this._hasLimit) throw new Error('db.update() 方法不支持 limit 条件');

    if (this._isTransaction && !this._hasWhereId) throw new Error('事务模式下 db.update() 的 where 条件必须是 _id');

    try {
      this._endHost('update');
      const res = await this._host.update(objectOmit(_mapCommandRaw(data), ['_id']));
      const { updated } = parseDatabaseOutput<{ updated: number }>(res);
      return updated;
    } catch (err) {
      const dbErr = err as UniError;
      throw this._options.parseError?.(dbErr) || dbErr;
    }
  }

  /**
   * 删除记录
   * @returns 删除结果
   */
  async remove() {
    if (this._hasLookup) throw new Error('db.remove() 方法不支持 lookup 聚合');
    if (!this._hasWhere) throw new Error('设置 where 条件后才能执行 db.remove() 方法');
    if (this._hasSelect) throw new Error('db.remove() 方法不支持 select 条件');
    if (this._hasOrder) throw new Error('db.remove() 方法不支持 order 条件');
    if (this._hasSkip) throw new Error('db.remove() 方法不支持 skip 条件');
    if (this._hasLimit) throw new Error('db.remove() 方法不支持 limit 条件');

    if (this._isTransaction && !this._hasWhereId) throw new Error('事务模式下 db.remove() 的 where 条件必须是 _id');

    try {
      this._endHost('remove');
      const res = await this._host.remove();
      const { deleted } = parseDatabaseOutput<{ deleted: number }>(res);
      return deleted;
    } catch (err) {
      const dbErr = err as UniError;
      throw this._options.parseError?.(dbErr) || dbErr;
    }
  }
}

function _toWhereMethod(whereFrom: _WhereFrom) {
  return whereFrom === 'where' ? 'where({...})' : 'whereId(id)';
}

function _toWhereIdMethod(whereFrom: _WhereFrom) {
  return whereFrom === 'where' ? 'where({ _id })' : 'whereId(id)';
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function _mapCommandRaw(data: any) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const map = (val: any): any => {
    if (!isObject(val)) return val;
    if (val instanceof DbBaseCommand) return DbBaseCommand.getValue(val, db0);
    return objectMap(val, map);
  };

  return objectMap(data, map);
}

function _mapOrderSelect(order: DbOrder<unknown>) {
  return objectMap(order, (val, key) => true);
}

function _mergeSelect(select: DbSelect<unknown>, order: DbOrder<unknown>) {
  const noSelect = Object.keys(select).length === 0;
  // 如果没有 select 条件，默认返回所有字段
  if (noSelect) return select;

  const onlyOmitId = Object.keys(select).length === 1 && '_id' in select && select._id === false;
  // 如果只排除 _id 字段，则保持现状
  if (onlyOmitId) return select;

  return {
    ...select,
    ..._mapOrderSelect(order),
  };
}
