import { errorAssign } from '@cloudcome/utils-core/error';
import { objectEach, objectOmit } from '@cloudcome/utils-core/object';
import type { AnyObject, LowercaseStartString } from '@cloudcome/utils-core/types';
import type { UniClientDatabaseOutput, UniCloudDatabaseOutput } from './types';

type DbSelectPositive = {
  [key: LowercaseStartString]: true;
};
type DbSelectNegative = { _id?: false };
export type DbSelect = Omit<DbSelectPositive, '_id'> & DbSelectNegative;
export type DbOrder = Record<string, 'asc' | 'desc'>;
export type DbRecord<S extends Record<string, boolean>> = {
  [K in keyof S as S[K] extends true ? K : never]: unknown;
};

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

export class Db {
  #db: UniCloud.CollectionReference;

  /**
   * 构造函数，初始化数据库集合引用
   * @param collection 集合名称
   * @param _mockDatabase 模拟数据库，用于单元测试
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  constructor(collection: string, _mockDatabase?: any) {
    this.#db = _mockDatabase || db0.collection(collection);
  }

  /**
   * 创建聚合操作实例
   * @returns 聚合操作实例
   */
  aggregate() {
    return this.#db.aggregate();
  }

  #hasWhere = 0;

  /**
   * 设置查询条件
   * @param where 查询条件对象
   * @returns 当前Db实例，支持链式调用
   */
  where(where: AnyObject) {
    this.#hasWhere++;
    // @ts-ignore
    this.#db = this.#db.where(where);
    return this;
  }

  #hasSelect = 0;

  /**
   * 指定要返回的字段
   * @param fields 要返回的字段对象，true表示返回，false表示不返回
   * @returns 当前Db实例，支持链式调用
   */
  select(fields: DbSelect) {
    if (this.#hasSelect) throw new Error('db.select() 方法只能调用一次');

    this.#hasSelect++;
    // @ts-ignore
    this.#db = this.#db.field(fields);
    return this;
  }

  #hasOrder = 0;

  /**
   * 设置排序规则
   * @param order 排序规则对象，key为字段名，value为"asc"或"desc"
   * @returns 当前Db实例，支持链式调用
   */
  order(order: DbOrder) {
    this.#hasOrder++;
    objectEach(order, (val, key) => {
      // @ts-ignore
      this.#db = this.#db.orderBy(key, val);
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
    this.#db = this.#db.skip(skip);
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

    this.#hasLimit++;
    // @ts-ignore
    this.#db = this.#db.limit(limit);
    return this;
  }

  /**
   * 创建新记录
   * @param data 要创建的数据
   * @returns 创建结果
   */
  async create(data: AnyObject) {
    if (this.#hasWhere) throw new Error('db.create() 方法不支持 where 条件');
    if (this.#hasSelect) throw new Error('db.create() 方法不支持 select 条件');
    if (this.#hasOrder) throw new Error('db.create() 方法不支持 order 条件');
    if (this.#hasSkip) throw new Error('db.create() 方法不支持 skip 条件');
    if (this.#hasLimit) throw new Error('db.create() 方法不支持 limit 条件');

    const res = await this.#db.add(data);
    return parseDatabaseOutput<{ id: string }>(res);
  }

  /**
   * 执行查询操作
   * @returns 查询结果
   */
  async query<T>() {
    const res = await this.#db.get();
    return parseDatabaseOutput<{ data: T[] }>(res);
  }

  /**
   * 只查询一条，自动添加 limit(1) 条件
   * @param ignoreMiss 是否忽略没有匹配到记录
   * @returns 查询结果
   */
  async queryOne<T>(): Promise<T>;
  async queryOne<T>(ignoreMiss: false): Promise<T>;
  async queryOne<T>(ignoreMiss: true): Promise<T | undefined>;
  async queryOne<T>(ignoreMiss = false): Promise<T | undefined> {
    if (this.#hasLimit) throw new Error('db.queryOne() 方法不支持 limit 条件');

    this.limit(1);
    const { data } = await this.query<T>();
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

    const res = await this.#db.count();
    return parseDatabaseOutput<{ total: number }>(res);
  }

  /**
   * 更新记录
   * @param data 要更新的数据
   * @returns 更新结果
   */
  async update(data: AnyObject) {
    if (!this.#hasWhere) throw new Error('设置 where 条件后才能调用 db.update() 方法');
    if (this.#hasSelect) throw new Error('db.update() 方法不支持 select 条件');
    if (this.#hasOrder) throw new Error('db.update() 方法不支持 order 条件');
    if (this.#hasSkip) throw new Error('db.update() 方法不支持 skip 条件');
    if (this.#hasLimit) throw new Error('db.update() 方法不支持 limit 条件');

    const res = await this.#db.update(data);
    return parseDatabaseOutput<{ updated: number }>(res);
  }

  /**
   * 删除记录
   * @returns 删除结果
   */
  async remove() {
    if (!this.#hasWhere) throw new Error('设置 where 条件后才能调用 db.remove() 方法');
    if (this.#hasSelect) throw new Error('db.remove() 方法不支持 select 条件');
    if (this.#hasOrder) throw new Error('db.remove() 方法不支持 order 条件');
    if (this.#hasSkip) throw new Error('db.remove() 方法不支持 skip 条件');
    if (this.#hasLimit) throw new Error('db.remove() 方法不支持 limit 条件');

    const res = await this.#db.remove();
    return parseDatabaseOutput<{ deleted: number }>(res);
  }
}

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
