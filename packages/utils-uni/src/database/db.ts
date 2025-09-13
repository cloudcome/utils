import { parseCloudObjectOutput } from '@/_helpers';
import { type UniCloudObjectOutput, respondCloudObject } from '@/cloud';
import { objectEach } from '@cloudcome/utils-core/object';

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
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  constructor(collection: string, _mockDatabase?: any) {
    this.#db = _mockDatabase || db0.collection(collection);
  }

  aggregate() {
    return new Aggregate(this.#db).start();
  }

  start() {
    return {
      where: this.where.bind(this),
      select: this.select.bind(this),
      order: this.order.bind(this),
      skip: this.skip.bind(this),
      limit: this.limit.bind(this),
      create: this.create.bind(this),
      count: this.count.bind(this),
      query: this.query.bind(this),
      aggregate: this.aggregate.bind(this),
    };
  }

  /**
   * 设置查询条件
   * @param where 查询条件对象
   * @returns 当前Db实例，支持链式调用
   */
  where(where: AnyObject) {
    // @ts-ignore
    this.#db = this.#db.where(where);
    return {
      where: this.where.bind(this),
      select: this.select.bind(this),
      order: this.order.bind(this),
      skip: this.skip.bind(this),
      limit: this.limit.bind(this),
      count: this.count.bind(this),
      query: this.query.bind(this),
      update: this.update.bind(this),
      remove: this.remove.bind(this),
    };
  }

  /**
   * 指定要返回的字段
   * @param fields 要返回的字段对象，true表示返回，false表示不返回
   * @returns 当前Db实例，支持链式调用
   */
  select(fields: Record<string, true> & { _id?: false }) {
    // @ts-ignore
    this.#db = this.#db.field(fields);
    return {
      where: this.where.bind(this),
      order: this.order.bind(this),
      skip: this.skip.bind(this),
      limit: this.limit.bind(this),
      query: this.query.bind(this),
    };
  }

  /**
   * 设置排序规则
   * @param order 排序规则对象，key为字段名，value为"asc"或"desc"
   * @returns 当前Db实例，支持链式调用
   */
  order(order: Record<string, 'asc' | 'desc'>) {
    objectEach(order, (val, key) => {
      // @ts-ignore
      this.#db = this.#db.orderBy(key, val);
    });

    return {
      where: this.where.bind(this),
      order: this.order.bind(this),
      skip: this.skip.bind(this),
      limit: this.limit.bind(this),
      query: this.query.bind(this),
    };
  }

  /**
   * 跳过指定数量的记录
   * @param skip 要跳过的记录数
   * @returns 当前Db实例，支持链式调用
   */
  skip(skip: number) {
    // @ts-ignore
    this.#db = this.#db.skip(skip);
    return {
      where: this.where.bind(this),
      order: this.order.bind(this),
      limit: this.limit.bind(this),
      query: this.query.bind(this),
    };
  }

  /**
   * 限制返回的记录数量
   * @param limit 最大返回记录数
   * @returns 当前Db实例，支持链式调用
   */
  limit(limit: number) {
    // @ts-ignore
    this.#db = this.#db.limit(limit);
    return {
      where: this.where.bind(this),
      order: this.order.bind(this),
      skip: this.skip.bind(this),
      query: this.query.bind(this),
    };
  }

  /**
   * 创建新记录
   * @param data 要创建的数据
   * @returns 创建结果
   */
  async create(data: AnyObject) {
    const res = await this.#db.add(data);
    return respondDatabase<{ id: string }>(res);
  }

  /**
   * 获取匹配记录的数量
   * @returns 记录总数
   */
  async count() {
    const res = await this.#db.count();
    return respondDatabase<{ total: number }>(res);
  }

  /**
   * 执行查询操作
   * @returns 查询结果
   */
  async query<T>() {
    const res = await this.#db.get();
    return respondDatabase<{ data: T[] }>(res);
  }

  /**
   * 更新记录
   * @param data 要更新的数据
   * @returns 更新结果
   */
  async update(data: AnyObject) {
    const res = this.#db.update(data);
    return respondDatabase<{ updated: number }>(res);
  }

  /**
   * 删除记录
   * @returns 删除结果
   */
  async remove() {
    const res = this.#db.remove();
    return respondDatabase<{ deleted: number }>(res);
  }
}

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
    return new Db(collection).start();
  },
};

/**
 * 处理云端响应结果
 * @param res 云端响应结果
 * @returns 处理后的结果
 */
export function respondDatabase<T>(res: AnyObject) {
  return respondCloudObject(() => {
    const keys = Object.keys(res);
    // 客户端 { result: {errCode: 0, errMsg: 'ok'} & 数据 }
    const isClient = keys.length === 1 && keys[0] === 'result';

    if (isClient) {
      return parseCloudObjectOutput((res as { result: UniCloudObjectOutput<T> }).result);
    }

    // 云端 数据
    return res as T;
  });
}
