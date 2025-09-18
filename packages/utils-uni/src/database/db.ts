import { errorAssign } from '@cloudcome/utils-core/error';
import { objectEach, objectMap, objectOmit } from '@cloudcome/utils-core/object';
import { isArray, isFunction, isNumber, isString } from '@cloudcome/utils-core/type';
import type {
  AnyObject,
  HasProperty,
  IsEmptyObject,
  IsOnlyProperty,
  MergeIntersection,
  UnionToIntersection,
} from '@cloudcome/utils-core/types';
import type { UniClientDatabaseOutput, UniCloudDatabaseOutput, UniDatabaseCommand } from './types';

export type DbWhere<T> = {
  [K in keyof T]?: unknown;
};
export type DbSelect<T> = {
  [K in keyof T]?: K extends '_id' ? false : true;
};
export type DbFieldsDefault<T> = {
  [K in keyof T]: true;
};
type _DbFields<T, S extends DbSelect<T>> = IsEmptyObject<S> extends true // 判断是否为空对象
  ? // 默认全部字段
    DbFieldsDefault<T>
  : // 判断 _id 是否为唯一属性
    IsOnlyProperty<S, '_id'> extends true
    ? // 从默认字段里排除 _id
      Omit<DbFieldsDefault<T>, '_id'>
    : // 判断是否有 _id
      HasProperty<S, '_id'> extends true
      ? // 有的话保留 {_id, ...}
        S
      : // 没有的话补上 {_id, ...}
        S & { _id: true };
type _DbQuery<T, S extends Record<keyof T, boolean>> = {
  [K in keyof T as S[K] extends true ? K : never]: T[K];
};
// @ts-ignore
export type DbQuery<T, S extends DbSelect<T>, R> = _DbQuery<T, _DbFields<T, S>> & R;
export type DbForeign<T, S extends DbSelect<T>, R, J extends DbJoinType, A> = Record<
  A & string,
  J extends '1:1' ? DbQuery<T, S, R> : DbQuery<T, S, R>[]
>;
export type DbCreate<T> = Partial<T>;
export type DbUpdate<T> = Partial<T>;
export type DbOrder<T> = Record<keyof T, 'asc' | 'desc'>;

type _WhereFrom = 'where' | 'whereId';

const db0 = uniCloud.database();
/**
 * 数据库操作符命令
 */
export const dbCmd = db0.command as unknown as UniDatabaseCommand;

/**
 * 数据库聚合操作符命令
 */
export const dbAgg = db0.command.aggregate as UniCloud.AggregateCommand & {
  pipeline: () => UniCloud.AggregateReference & {
    done: () => unknown;
  };
};

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
export type DbLookupOptions<J extends DbJoinType, L, F, A> = {
  /**
   * 关联类型
   */
  type: J;

  /**
   * 主表字段
   */
  localField: keyof L & string;

  /**
   * 关联表字段
   */
  foreignField: keyof F & string;

  /**
   * 关联数据在结果中的字段名
   */
  as: A;
};

export type DbLookup = {
  /**
   * 关联表
   */
  table: Db<unknown>;

  /**
   * 关联类型
   */
  type: DbJoinType;

  /**
   * 主表字段
   */
  localField: string;

  /**
   * 关联表字段
   */
  foreignField: string;

  /**
   * 关联表名称
   */
  from: string;

  /**
   * 关联数据在结果中的字段名
   */
  as: string;
};

let gid = 0;

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export class Db<T, S extends DbSelect<T> = {}, R extends AnyObject = {}> {
  #host: UniCloud.CollectionReference;

  /**
   * 是否为事务环境
   * - 查询条件只能是 id
   * - 不能聚合操作
   */
  #isTransaction = false;

  #options: DbOptions;

  /**
   * 构造函数，初始化数据库集合引用
   * @param collection 数据表名称
   * @param _mockDatabase 模拟数据库，用于单元测试
   */
  constructor(options: DbOptions) {
    this.#options = options;
    this.#host =
      options._mockDatabase || options.transaction?.collection(options.table) || db0.collection(options.table);
    this.#isTransaction = !!options.transaction;
  }

  get table() {
    return this.#options.table;
  }

  /**
   * 获取聚合操作实例
   * @returns 聚合操作实例
   */
  aggregate() {
    return this.#host.aggregate();
  }

  #hasWhere: _WhereFrom | undefined = undefined;
  #hasWhereId: _WhereFrom | undefined = undefined;
  #where = {};

  #doWhere(where: DbWhere<T>, from: _WhereFrom) {
    if (this.#hasWhere) throw new Error(`已调用过一次 db.${_toWhereMethod(this.#hasWhere)} 了`);

    const whereKeys = Object.keys(where);
    // 只有 _id 值为字符串或数字时，才能调用 doc 方法
    const isWhereId = whereKeys.length === 1 && '_id' in where && (isString(where._id) || isNumber(where._id));

    if (isWhereId && this.#hasLimit) {
      throw new Error(`db.${_toWhereIdMethod(from)} 方法不能与 db.limit() 方法同时调用`);
    }

    this.#hasWhere = from;
    this.#where = where;
    if (isWhereId) this.#hasWhereId = from;

    return this;
  }

  /**
   * 设置查询条件
   * @param where 查询条件对象
   * @returns 当前Db实例，支持链式调用
   */
  where(where: DbWhere<T>) {
    return this.#doWhere(where, 'where');
  }

  /**
   * 根据ID设置查询条件
   * @param id 记录ID
   * @returns 当前Db实例，支持链式调用
   */
  whereId(id: string | number) {
    // @ts-ignore
    return this.#doWhere({ _id: id }, 'whereId');
  }

  #hasSelect = 0;
  #select = {};

  /**
   * 指定要返回的字段
   * @param fields 要返回的字段对象，true表示返回，false表示不返回
   * @returns 当前Db实例，支持链式调用
   */
  select<U extends DbSelect<T>>(fields: U) {
    if (this.#hasSelect) throw new Error('db.select() 方法只能调用一次');

    this.#hasSelect++;
    this.#select = fields;

    return this as Db<T, S & U, R>;
  }

  #hasOrder = 0;
  #order = {};

  /**
   * 设置排序规则
   * @param order 排序规则对象，key为字段名，value为"asc"或"desc"
   * @returns 当前Db实例，支持链式调用
   */
  order(order: DbOrder<T>) {
    this.#hasOrder++;
    this.#order = order;

    return this;
  }

  #hasSkip = 0;
  #skip = 0;

  /**
   * 跳过指定数量的记录
   * @param skip 要跳过的记录数
   * @returns 当前Db实例，支持链式调用
   */
  skip(skip: number) {
    if (this.#hasSkip) throw new Error('db.skip() 方法只能调用一次');

    this.#hasSkip++;
    this.#skip = skip;

    return this;
  }

  #hasLimit = 0;
  #limit = 0;

  /**
   * 限制返回的记录数量
   * @param limit 最大返回记录数
   * @returns 当前Db实例，支持链式调用
   */
  limit(limit: number) {
    if (this.#hasLimit) throw new Error('db.limit() 方法只能调用一次');

    if (this.#hasWhereId) {
      throw new Error(`db.limit() 方法不能与 ${_toWhereIdMethod(this.#hasWhereId)} 方法同时调用`);
    }

    this.#hasLimit++;
    this.#limit = limit;

    return this;
  }

  #hasLookup = 0;
  get hasLookup() {
    return this.#hasLookup > 0;
  }

  #lookups: DbLookup[] = [];
  lookup<FT, FS extends DbSelect<FT>, FR extends AnyObject, J extends DbJoinType, A extends string>(
    table: Db<FT, FS, FR>,
    lookup: DbLookupOptions<J, T, FT, A>,
  ) {
    // 对方表也记为关联查询，避免做表更新操作
    table.#hasLookup++;
    this.#hasLookup++;
    this.#lookups.push({
      ...lookup,
      table,
      from: table.table,
    });

    // 这里必须合并联合类型，否则类型结果会丢失最后一次 lookup
    // @ts-ignore
    return this as Db<T, S, MergeIntersection<R & DbForeign<FT, FS, FR, J, A>>>;
  }

  #aggregated = false;
  #endAggregate(aggRef: UniCloud.AggregateReference) {
    if (this.#aggregated) throw new Error(`相同的数据表实例(${this.table})不能重复使用`);

    this.#aggregated = true;
    let returnAggRef = aggRef;
    const projects: Record<string, true> = {};

    for (const { type, as, foreignField, from, localField, table } of this.#lookups) {
      const varName = `v${gid++}`;
      let pipeline = dbAgg.pipeline();

      // 关联条件
      // @ts-ignore
      pipeline = pipeline.match(
        dbCmd.expr(
          type === 'n:1'
            ? // @ts-ignore
              dbAgg.in([`$${foreignField}`, `$$${varName}`])
            : dbAgg.eq([`$${foreignField}`, `$$${varName}`]),
        ),
      );

      // 其他查询条件
      // @ts-ignore
      pipeline = table.#endAggregate(pipeline);

      // @ts-ignore
      pipeline = pipeline.done();

      returnAggRef = returnAggRef.lookup({
        let: {
          [varName]: `$${localField}`,
        },
        as,
        from,
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

      projects[as] = true;
    }

    // 主表查询
    if (this.#hasWhere) returnAggRef = returnAggRef.match(this.#where);
    if (this.#hasSelect) returnAggRef = returnAggRef.project({ ...this.#select, ...projects });
    if (this.#hasOrder) returnAggRef = returnAggRef.sort(objectMap(this.#order, (v) => (v === 'asc' ? 1 : -1)));
    if (this.#hasSkip) returnAggRef = returnAggRef.skip(this.#skip);
    if (this.#hasLimit) returnAggRef = returnAggRef.limit(this.#limit);

    return returnAggRef;
  }

  #endHost() {
    if (this.#hasWhere) {
      // @ts-ignore
      this.#host = this.#host.where(this.#where);
    }

    if (this.#hasSelect) {
      // @ts-ignore
      this.#host = this.#host.field(this.#select);
    }

    if (this.#hasOrder) {
      objectEach(this.#order, (val, key) => {
        // @ts-ignore
        this.#host = this.#host.orderBy(key, val);
      });
    }

    // @ts-ignore
    if (this.#hasSkip) this.#host = this.#host.skip(this.#skip);

    // @ts-ignore
    if (this.#hasLimit) this.#host = this.#host.limit(this.#limit);
    // @ts-ignore
    else if (this.#hasWhereId) this.#host = this.#host.limit(1);
  }

  /**
   * 执行查询操作
   * @returns 查询结果
   */
  async query() {
    let res: { data: DbQuery<T, S, R>[] };

    // 关联查询
    if (this.#hasLookup) {
      const aggRef = this.aggregate();
      this.#endAggregate(aggRef);
      res = await aggRef.end();
    }
    // 单表查询
    else {
      this.#endHost();
      res = await this.#host.get();
    }

    const rows = isArray(res.data) ? res.data : [res.data];
    const { data } = parseDatabaseOutput(res);
    return data;
  }

  /**
   * 只查询一条，自动添加 limit(1) 条件
   * @param ignoreMiss 是否忽略没有匹配到记录
   * @returns 查询结果
   */
  async queryOne(): Promise<DbQuery<T, S, R>>;
  async queryOne(ignoreMiss: false): Promise<DbQuery<T, S, R>>;
  async queryOne(ignoreMiss: true): Promise<DbQuery<T, S, R> | undefined>;
  async queryOne(ignoreMiss = false): Promise<DbQuery<T, S, R> | undefined> {
    if (this.#hasLimit) throw new Error('db.queryOne() 方法不支持 limit 条件');
    if (!this.#hasWhereId) this.limit(1);

    const data = await this.query();
    const res = data.at(0);

    if (!ignoreMiss && !res) throw new Error('未找到匹配记录');
    return res;
  }

  /**
   * 获取匹配记录的数量
   * @returns 记录总数
   */
  async count() {
    if (this.#hasLookup) throw new Error('db.count() 方法不支持 lookup 聚合');
    if (this.#hasSelect) throw new Error('db.count() 方法不支持 select 条件');
    if (this.#hasOrder) throw new Error('db.count() 方法不支持 order 条件');
    if (this.#hasSkip) throw new Error('db.count() 方法不支持 skip 条件');
    if (this.#hasLimit) throw new Error('db.count() 方法不支持 limit 条件');

    this.#endHost();
    const res = await this.#host.count();
    const { total } = parseDatabaseOutput<{ total: number }>(res);
    return total;
  }

  /**
   * 创建新记录
   * @param data 要创建的数据
   * @returns 创建结果
   */
  async create(data: DbCreate<T>) {
    if (this.#hasLookup) throw new Error('db.create() 方法不支持 lookup 聚合');
    if (this.#hasWhere) throw new Error('db.create() 方法不支持 where 条件');
    if (this.#hasSelect) throw new Error('db.create() 方法不支持 select 条件');
    if (this.#hasOrder) throw new Error('db.create() 方法不支持 order 条件');
    if (this.#hasSkip) throw new Error('db.create() 方法不支持 skip 条件');
    if (this.#hasLimit) throw new Error('db.create() 方法不支持 limit 条件');

    this.#endHost();
    const res = await this.#host.add(data);
    const { id } = parseDatabaseOutput<{ id: string }>(res);
    return id;
  }

  /**
   * 更新记录
   * @param data 要更新的数据
   * @returns 更新结果
   */
  async update(data: AnyObject) {
    if (this.#hasLookup) throw new Error('db.update() 方法不支持 lookup 聚合');
    if (!this.#hasWhere) throw new Error('设置 where 条件后才能执行 db.update() 方法');
    if (this.#hasSelect) throw new Error('db.update() 方法不支持 select 条件');
    if (this.#hasOrder) throw new Error('db.update() 方法不支持 order 条件');
    if (this.#hasSkip) throw new Error('db.update() 方法不支持 skip 条件');
    if (this.#hasLimit) throw new Error('db.update() 方法不支持 limit 条件');

    if (this.#isTransaction && !this.#hasWhereId) throw new Error('事务模式下 db.update() 的 where 条件必须是 _id');

    this.#endHost();
    const res = await this.#host.update(data);
    const { updated } = parseDatabaseOutput<{ updated: number }>(res);
    return updated;
  }

  /**
   * 删除记录
   * @returns 删除结果
   */
  async remove() {
    if (this.#hasLookup) throw new Error('db.remove() 方法不支持 lookup 聚合');
    if (!this.#hasWhere) throw new Error('设置 where 条件后才能执行 db.remove() 方法');
    if (this.#hasSelect) throw new Error('db.remove() 方法不支持 select 条件');
    if (this.#hasOrder) throw new Error('db.remove() 方法不支持 order 条件');
    if (this.#hasSkip) throw new Error('db.remove() 方法不支持 skip 条件');
    if (this.#hasLimit) throw new Error('db.remove() 方法不支持 limit 条件');

    if (this.#isTransaction && !this.#hasWhereId) throw new Error('事务模式下 db.remove() 的 where 条件必须是 _id');

    this.#endHost();
    const res = await this.#host.remove();
    const { deleted } = parseDatabaseOutput<{ deleted: number }>(res);
    return deleted;
  }
}

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type DbProxy<T, S extends DbSelect<T> = {}, R extends AnyObject = {}> = Db<T, S, R> & {
  _isProxy: true;
};

/**
 * 数据库操作对象
 */
export const db = {
  /**
   * 获取指定名称的数据库集合实例
   * @param name 数据表名称
   * @returns Db类实例，用于执行数据库操作
   */
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  table<T, S extends DbSelect<T> = {}, R extends AnyObject = {}>(name: string) {
    return new Proxy(
      {},
      {
        get(target, prop) {
          if (prop === '_isProxy') return true;

          const table = new Db<T, S, R>({ table: name });
          const tableProp = prop as keyof Db<T, S, R>;
          const ref = table[tableProp];

          return isFunction(ref) ? ref.bind(table) : ref;
        },
      },
    ) as DbProxy<T>;
  },
};

/**
 * 解析数据库执行结果
 * @param res 客户端、云端响应结果
 * @returns 处理后的结果
 */
export function parseDatabaseOutput<T>(res: UniClientDatabaseOutput<T> | UniCloudDatabaseOutput<T>) {
  const keys = Object.keys(res as AnyObject);
  // 客户端 { result: {errCode: 0, errMsg: 'ok'} & 数据 }
  const isClient = keys.length === 1 && keys[0] === 'result';

  if (isClient) {
    const { result } = res as UniClientDatabaseOutput<T>;
    if (!result.errCode) return objectOmit(result, ['errCode', 'errMsg', 'code', 'message']);
    throw errorAssign(new Error(result.errMsg), result);
  }

  // 云端 数据
  return res as T;
}

function _toWhereMethod(whereFrom: _WhereFrom) {
  return whereFrom === 'where' ? 'where({...})' : 'whereId(id)';
}

function _toWhereIdMethod(whereFrom: _WhereFrom) {
  return whereFrom === 'where' ? 'where({ _id })' : 'whereId(id)';
}
