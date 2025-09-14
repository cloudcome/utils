import { errorAssign } from '@cloudcome/utils-core/error';
import { objectEach, objectOmit } from '@cloudcome/utils-core/object';
import type {
  AnyObject,
  HasProperty,
  IsEmptyObject,
  IsOnlyProperty,
  LowercaseStartString,
} from '@cloudcome/utils-core/types';
import type { UniClientDatabaseOutput, UniCloudDatabaseOutput } from './types';

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
export type DbQuery<T, S extends DbSelect<T>> = _DbQuery<T, _DbFields<T, S>>;
export type DbCreate<T> = Partial<T>;
export type DbUpdate<T> = Partial<T>;
export type DbOrder<T> = Record<keyof T, 'asc' | 'desc'>;

type _WhereFrom = 'where' | 'whereId';

const db0 = uniCloud.database();
/**
 * 数据库操作符命令
 */
export const dbCmd = db0.command;

/**
 * 数据库聚合操作符命令
 */
export const dbAgg = db0.command.aggregate;

class Aggregate {
  #db: UniCloud.CollectionReference;

  constructor(db: UniCloud.CollectionReference) {
    this.#db = db;
  }

  start() {
    return this.#db.aggregate();
  }
}

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

export class Db<T, S extends DbSelect<T> = Record<string, never>> {
  #host: UniCloud.CollectionReference;

  /**
   * 是否为事务环境
   * - 查询条件只能是 id
   * - 不能聚合操作
   */
  #isTransaction: boolean;

  /**
   * 构造函数，初始化数据库集合引用
   * @param collection 数据表名称
   * @param _mockDatabase 模拟数据库，用于单元测试
   */
  constructor(options: DbOptions) {
    this.#host = options._mockDatabase || options.transaction || db0.collection(options.table);
    this.#isTransaction = !!options.transaction;
  }

  /**
   * 创建聚合操作实例
   * @returns 聚合操作实例
   */
  aggregate() {
    if (!this.#isTransaction) throw new Error('db.aggregate() 不支持事务模式');

    return this.#host.aggregate();
  }

  #hasWhere: _WhereFrom | undefined = undefined;
  #hasWhereId: _WhereFrom | undefined = undefined;

  #where(where: DbWhere<T>, from: _WhereFrom) {
    if (this.#hasWhere) throw new Error(`已调用过一次 db.${_toWhereMethod(this.#hasWhere)} 了`);

    const whereKeys = Object.keys(where);
    const isWhereId = whereKeys.length === 1 && whereKeys[0] === '_id';

    if (isWhereId && this.#hasLimit) {
      throw new Error(`db.${_toWhereIdMethod(from)} 方法不能与 db.limit() 方法同时调用`);
    }

    this.#hasWhere = from;

    if (isWhereId) {
      this.#hasWhereId = from;
      // @ts-ignore
      this.#host = this.#host.doc(where._id);
    } else {
      // @ts-ignore
      this.#host = this.#host.where(where);
    }

    return this;
  }

  /**
   * 设置查询条件
   * @param where 查询条件对象
   * @returns 当前Db实例，支持链式调用
   */
  where(where: DbWhere<T>) {
    return this.#where(where, 'where');
  }

  /**
   * 根据ID设置查询条件
   * @param id 记录ID
   * @returns 当前Db实例，支持链式调用
   */
  whereId(id: string) {
    // @ts-ignore
    return this.#where({ _id: id }, 'whereId');
  }

  #hasSelect = 0;

  /**
   * 指定要返回的字段
   * @param fields 要返回的字段对象，true表示返回，false表示不返回
   * @returns 当前Db实例，支持链式调用
   */
  select<U extends DbSelect<T>>(fields: U): Db<T, U> {
    if (this.#hasSelect) throw new Error('db.select() 方法只能调用一次');

    this.#hasSelect++;
    // @ts-ignore
    this.#host = this.#host.field(fields);
    // @ts-ignore
    return this;
  }

  #hasOrder = 0;

  /**
   * 设置排序规则
   * @param order 排序规则对象，key为字段名，value为"asc"或"desc"
   * @returns 当前Db实例，支持链式调用
   */
  order(order: DbOrder<T>) {
    this.#hasOrder++;
    objectEach(order, (val, key) => {
      // @ts-ignore
      this.#host = this.#host.orderBy(key, val);
    });

    return this;
  }

  #hasSkip = 0;

  /**
   * 跳过指定数量的记录
   * @param skip 要跳过的记录数
   * @returns 当前Db实例，支持链式调用
   */
  skip(skip: number) {
    if (this.#hasSkip) throw new Error('db.skip() 方法只能调用一次');

    this.#hasSkip++;
    // @ts-ignore
    this.#host = this.#host.skip(skip);
    return this;
  }

  #hasLimit = 0;

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
    // @ts-ignore
    this.#host = this.#host.limit(limit);
    return this;
  }

  /**
   * 创建新记录
   * @param data 要创建的数据
   * @returns 创建结果
   */
  async create(data: DbCreate<T>) {
    if (this.#hasWhere) throw new Error('db.create() 方法不支持 where 条件');
    if (this.#hasSelect) throw new Error('db.create() 方法不支持 select 条件');
    if (this.#hasOrder) throw new Error('db.create() 方法不支持 order 条件');
    if (this.#hasSkip) throw new Error('db.create() 方法不支持 skip 条件');
    if (this.#hasLimit) throw new Error('db.create() 方法不支持 limit 条件');

    const res = await this.#host.add(data);
    const { id } = parseDatabaseOutput<{ id: string }>(res);
    return id;
  }

  /**
   * 执行查询操作
   * @returns 查询结果
   */
  async query() {
    const res = await this.#host.get();
    const { data } = parseDatabaseOutput<{ data: DbQuery<T, S>[] }>(res);
    return data;
  }

  /**
   * 只查询一条，自动添加 limit(1) 条件
   * @param ignoreMiss 是否忽略没有匹配到记录
   * @returns 查询结果
   */
  async queryOne(): Promise<DbQuery<T, S>>;
  async queryOne(ignoreMiss: false): Promise<DbQuery<T, S>>;
  async queryOne(ignoreMiss: true): Promise<DbQuery<T, S> | undefined>;
  async queryOne(ignoreMiss = false): Promise<DbQuery<T, S> | undefined> {
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
    if (this.#hasSelect) throw new Error('db.count() 方法不支持 select 条件');
    if (this.#hasOrder) throw new Error('db.count() 方法不支持 order 条件');
    if (this.#hasSkip) throw new Error('db.count() 方法不支持 skip 条件');
    if (this.#hasLimit) throw new Error('db.count() 方法不支持 limit 条件');

    const res = await this.#host.count();
    const { total } = parseDatabaseOutput<{ total: number }>(res);
    return total;
  }

  /**
   * 更新记录
   * @param data 要更新的数据
   * @returns 更新结果
   */
  async update(data: AnyObject) {
    if (!this.#hasWhere) throw new Error('设置 where 条件后才能执行 db.update() 方法');
    if (this.#hasSelect) throw new Error('db.update() 方法不支持 select 条件');
    if (this.#hasOrder) throw new Error('db.update() 方法不支持 order 条件');
    if (this.#hasSkip) throw new Error('db.update() 方法不支持 skip 条件');
    if (this.#hasLimit) throw new Error('db.update() 方法不支持 limit 条件');

    if (this.#isTransaction && !this.#hasWhereId) throw new Error('事务模式下 db.update() 的 where 条件必须是 _id');

    const res = await this.#host.update(data);
    const { updated } = parseDatabaseOutput<{ updated: number }>(res);
    return updated;
  }

  /**
   * 删除记录
   * @returns 删除结果
   */
  async remove() {
    if (!this.#hasWhere) throw new Error('设置 where 条件后才能执行 db.remove() 方法');
    if (this.#hasSelect) throw new Error('db.remove() 方法不支持 select 条件');
    if (this.#hasOrder) throw new Error('db.remove() 方法不支持 order 条件');
    if (this.#hasSkip) throw new Error('db.remove() 方法不支持 skip 条件');
    if (this.#hasLimit) throw new Error('db.remove() 方法不支持 limit 条件');

    if (this.#isTransaction && !this.#hasWhereId) throw new Error('事务模式下 db.remove() 的 where 条件必须是 _id');

    const res = await this.#host.remove();
    const { deleted } = parseDatabaseOutput<{ deleted: number }>(res);
    return deleted;
  }
}

/**
 * 数据库操作对象
 */
export const db = {
  /**
   * 获取指定名称的数据库集合实例
   * @param table 数据表名称
   * @returns Db类实例，用于执行数据库操作
   */
  table<T, S extends DbSelect<T> = Record<never, never>>(table: string) {
    return new Db<T, S>({ table });
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
