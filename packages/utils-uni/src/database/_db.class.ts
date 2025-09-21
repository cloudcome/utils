import { parseDatabaseOutput } from '@/database';
import { objectEach, objectMap } from '@cloudcome/utils-core/object';
import { isArray, isNumber, isObject, isString } from '@cloudcome/utils-core/type';
import type {
  AnyObject,
  Exact,
  HasProperty,
  IsEmptyObject,
  IsOnlyProperty,
  MergeIntersection,
} from '@cloudcome/utils-core/types';
import { DbBaseCommand, type DbMutateCommand, type DbQueryCommand } from './_command.class';

/**
 * 数据库聚合操作符命令
 */
const dbAgg = uniCloud.database().command.aggregate as UniCloud.AggregateCommand & {
  pipeline: () => UniCloud.AggregateReference & {
    done: () => unknown;
  };
};

export type DbWhere<T> = {
  [K in keyof T]?: T[K] | DbQueryCommand;
};
export type DbSelect<T> = {
  [K in keyof T]?: K extends '_id' ? boolean : true;
};
export type DbFieldsDefault<T> = {
  [K in keyof T]: true;
};
type _OnlyFieldId<D, V> = IsOnlyProperty<D, '_id'> extends true
  ? '_id' extends keyof D
    ? D['_id'] extends V
      ? true
      : false
    : false
  : false;
type _DbFields<D, S extends DbSelect<D>> = IsEmptyObject<S> extends true // 判断是否为空对象
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
type _DbQuery<D1, S1 extends DbSelect<D1>> = {
  [K in keyof D1 as S1[K] extends true ? K : never]: D1[K];
};
// @ts-ignore
export type DbQuery<D1, S1 extends DbSelect<D1>, D2> = _DbQuery<D1, _DbFields<D1, S1>> & D2;
export type DbForeign<D1, S1 extends DbSelect<D1>, D2, JT extends DbJoinType, AS extends string> = Record<
  AS,
  JT extends '1:1' ? DbQuery<D1, S1, D2> : DbQuery<D1, S1, D2>[]
>;
export type DbCreate<T> = Partial<T>;
export type DbUpdate<T> = {
  [K in keyof T]?: T[K] | DbMutateCommand;
};
export type DbOrder<T> = Record<keyof T, 'asc' | 'desc'>;

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
};

/**
 * 数据库关联类型
 * - '1:1': 一对一关联，返回值 1 个
 * - '1:n': 一对多关联，返回值 n 个
 * - 'n:1': 多对一关联，返回值 n 个
 */
export type DbJoinType = '1:1' | '1:n' | 'n:1';
// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
export type DbLookupOptions<JT extends DbJoinType, D1, FD1, AS, US extends boolean | undefined | void = undefined> = {
  /**
   * 关联类型
   */
  type: JT;

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

  get table() {
    return this._options.table;
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

    const whereKeys = Object.keys(where);
    // 只有 _id 值为字符串或数字时，才能调用 doc 方法
    const isWhereId = whereKeys.length === 1 && '_id' in where && (isString(where._id) || isNumber(where._id));

    if (isWhereId && this._hasLimit) {
      throw new Error(`db.${_toWhereIdMethod(from)} 方法不能与 db.limit() 方法同时调用`);
    }

    this._hasWhere = from;
    this._where = where;
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
  select<S extends DbSelect<D1>>(fields: Exact<S, DbSelect<D1>>) {
    if (this._hasSelect) throw new Error('db.select() 方法只能调用一次');

    this._hasSelect++;
    this._select = fields;

    return this;
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
    JT extends DbJoinType,
    AS extends string,
    // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
    US extends boolean | undefined | void = undefined,
  >(table: Db<FD1, FS1, FD2, FW2>, lookup: DbLookupOptions<JT, D1, FD1, AS, US>) {
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
      US extends true ? D2 : MergeIntersection<D2 & DbForeign<FD1, FS1, FD2, JT, AS>>,
      MergeIntersection<W2 & Partial<Record<AS, DbQueryCommand>>>
    >;
  }

  private _aggregated = false;
  private _endAggregate(aggRef: UniCloud.AggregateReference) {
    if (this._aggregated) throw new Error(`相同的数据表实例(${this.table})不能重复使用`);

    this._aggregated = true;
    let returnAggRef = aggRef;
    const projects: Record<string, true> = {};

    for (const { type, as, foreignField, localField, table, unselect } of this._lookups) {
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

      if (as && !unselect) projects[as] = true;
    }

    // 主表查询
    if (this._hasWhere) returnAggRef = returnAggRef.match(_mapCommandRaw(this._where));
    if (this._hasSelect) returnAggRef = returnAggRef.project({ ...this._select, ...projects });
    if (this._hasOrder) returnAggRef = returnAggRef.sort(objectMap(this._order, (v) => (v === 'asc' ? 1 : -1)));
    if (this._hasSkip) returnAggRef = returnAggRef.skip(this._skip);
    if (this._hasLimit) returnAggRef = returnAggRef.limit(this._limit);

    return returnAggRef;
  }

  private _endHost() {
    if (this._hasWhere) {
      // @ts-ignore
      this._host = this._host.where(_mapCommandRaw(this._where));
    }

    if (this._hasSelect) {
      // @ts-ignore
      this._host = this._host.field(this._select);
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
    if (this._hasLimit) this._host = this._host.limit(this._limit);
    // @ts-ignore
    else if (this._hasWhereId) this._host = this._host.limit(1);
  }

  /**
   * 执行查询操作
   * @returns 查询结果
   */
  async query() {
    let res: { data: DbQuery<D1, S1, D2>[] };

    // 关联查询
    if (this._hasLookup) {
      const aggRef = this.aggregate();
      this._endAggregate(aggRef);
      res = await aggRef.end();
    }
    // 单表查询
    else {
      this._endHost();
      res = await this._host.get();
    }

    const rows = isArray(res.data) ? res.data : [res.data];
    const { data } = parseDatabaseOutput(res);
    return data;
  }

  /**
   * 只查询一条，自动添加 limit(1) 条件
   * @param allowMiss 是否允许没有匹配到记录，如果为 true，则可能返回 undefined
   * @returns 查询结果
   */
  async queryOne(): Promise<DbQuery<D1, S1, D2>>;
  async queryOne(allowMiss: false): Promise<DbQuery<D1, S1, D2>>;
  async queryOne(allowMiss: true): Promise<DbQuery<D1, S1, D2> | undefined>;
  async queryOne(allowMiss = false): Promise<DbQuery<D1, S1, D2> | undefined> {
    if (this._hasLimit) throw new Error('db.queryOne() 方法不支持 limit 条件');
    if (!this._hasWhereId) this.limit(1);

    const data = await this.query();
    const res = data.at(0);

    if (!allowMiss && !res) throw new Error('未找到匹配记录');
    return res;
  }

  /**
   * 获取匹配记录的数量
   * @returns 记录总数
   */
  async count() {
    if (this._hasLookup) throw new Error('db.count() 方法不支持 lookup 聚合');
    if (this._hasSelect) throw new Error('db.count() 方法不支持 select 条件');
    if (this._hasOrder) throw new Error('db.count() 方法不支持 order 条件');
    if (this._hasSkip) throw new Error('db.count() 方法不支持 skip 条件');
    if (this._hasLimit) throw new Error('db.count() 方法不支持 limit 条件');

    this._endHost();
    const res = await this._host.count();
    const { total } = parseDatabaseOutput<{ total: number }>(res);
    return total;
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

    this._endHost();
    const res = await this._host.add(data);
    const { id } = parseDatabaseOutput<{ id: string }>(res);
    return id;
  }

  /**
   * 更新记录
   * @param data 要更新的数据
   * @returns 更新结果
   */
  async update(data: AnyObject) {
    if (this._hasLookup) throw new Error('db.update() 方法不支持 lookup 聚合');
    if (!this._hasWhere) throw new Error('设置 where 条件后才能执行 db.update() 方法');
    if (this._hasSelect) throw new Error('db.update() 方法不支持 select 条件');
    if (this._hasOrder) throw new Error('db.update() 方法不支持 order 条件');
    if (this._hasSkip) throw new Error('db.update() 方法不支持 skip 条件');
    if (this._hasLimit) throw new Error('db.update() 方法不支持 limit 条件');

    if (this._isTransaction && !this._hasWhereId) throw new Error('事务模式下 db.update() 的 where 条件必须是 _id');

    this._endHost();
    const res = await this._host.update(_mapCommandRaw(data));
    const { updated } = parseDatabaseOutput<{ updated: number }>(res);
    return updated;
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

    this._endHost();
    const res = await this._host.remove();
    const { deleted } = parseDatabaseOutput<{ deleted: number }>(res);
    return deleted;
  }
}

function _toWhereMethod(whereFrom: _WhereFrom) {
  return whereFrom === 'where' ? 'where({...})' : 'whereId(id)';
}

function _toWhereIdMethod(whereFrom: _WhereFrom) {
  return whereFrom === 'where' ? 'where({ _id })' : 'whereId(id)';
}

function _mapCommandRaw(where: Record<string, unknown>) {
  return objectMap(where, (val, key) => {
    return isObject(val) && val instanceof DbBaseCommand ? val.getValue(db0) : val;
  });
}
