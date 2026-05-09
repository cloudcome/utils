import {
  DbBaseCommand,
  DbMutateCommand,
  DbQueryCommand,
} from './_command.class';

/**
 * 数据库查询命令对象，提供各种查询操作符
 */
export const dbQuery = {
  /**
   * 等于操作符
   * @param value 比较值
   * @returns DbQueryCommand 查询命令对象
   */
  eq: (value: unknown) => new DbQueryCommand('eq', value),

  /**
   * 不等于操作符
   * @param value 比较值
   * @returns DbQueryCommand 查询命令对象
   */
  neq: (value: unknown) => new DbQueryCommand('neq', value),

  /**
   * 大于操作符
   * @param value 比较值
   * @returns DbQueryCommand 查询命令对象
   */
  gt: (value: unknown) => new DbQueryCommand('gt', value),

  /**
   * 大于等于操作符
   * @param value 比较值
   * @returns DbQueryCommand 查询命令对象
   */
  gte: (value: unknown) => new DbQueryCommand('gte', value),

  /**
   * 小于操作符
   * @param value 比较值
   * @returns DbQueryCommand 查询命令对象
   */
  lt: (value: unknown) => new DbQueryCommand('lt', value),

  /**
   * 小于等于操作符
   * @param value 比较值
   * @returns DbQueryCommand 查询命令对象
   */
  lte: (value: unknown) => new DbQueryCommand('lte', value),

  /**
   * 包含在数组中操作符
   * @param value 值数组
   * @returns DbQueryCommand 查询命令对象
   */
  in: (value: unknown[]) => new DbQueryCommand('in', value),

  /**
   * 不包含在数组中操作符
   * @param value 值数组
   * @returns DbQueryCommand 查询命令对象
   */
  nin: (value: unknown[]) => new DbQueryCommand('nin', value),

  /**
   * 数组长度匹配操作符
   * @param size 数组长度
   * @returns DbQueryCommand 查询命令对象
   */
  size: (size: number) => new DbQueryCommand('size', size),

  /**
   * 正则表达式匹配操作符
   * @param regExp 正则表达式
   * @returns DbQueryCommand 查询命令对象
   */
  regExp: (regExp: RegExp) =>
    new DbQueryCommand('regExp', regExp, {
      rewriteValue: (_db, parameter) => parameter,
    }),

  /**
   * 逻辑与操作符
   * @param conditions 查询条件参数
   * @returns DbQueryCommand 查询命令对象
   */
  and: (conditions: DbQueryCommand[]) =>
    new DbQueryCommand('and', conditions, {
      formatParameter: (db) =>
        conditions.map((c) => DbBaseCommand.getValue(c, db)),
    }),

  /**
   * 逻辑或操作符
   * @param conditions 查询条件参数
   * @returns DbQueryCommand 查询命令对象
   */
  or: (conditions: DbQueryCommand[]) =>
    new DbQueryCommand('or', conditions, {
      formatParameter: (db) =>
        conditions.map((c) => DbBaseCommand.getValue(c, db)),
    }),
};

/**
 * 数据库变更命令对象，提供各种数据更新操作符
 */
export const dbMutate = {
  /**
   * 数值增加操作符
   * @param value 增加的数值
   * @returns DbMutateCommand 变更命令对象
   */
  inc: (value: number) => new DbMutateCommand('inc', value),

  /**
   * 数值乘法操作符
   * @param value 乘数
   * @returns DbMutateCommand 变更命令对象
   */
  mul: (value: number) => new DbMutateCommand('mul', value),

  /**
   * 设置字段值操作符
   * @param value 设置的值
   * @returns DbMutateCommand 变更命令对象
   */
  set: (value: unknown) => new DbMutateCommand('set', value),

  /**
   * 向数组末尾添加元素操作符
   * @param value 添加的值
   * @returns DbMutateCommand 变更命令对象
   */
  push: (value: unknown) => new DbMutateCommand('push', value),

  /**
   * 向数组开头添加元素操作符
   * @param value 添加的值
   * @returns DbMutateCommand 变更命令对象
   */
  unshift: (value: unknown) => new DbMutateCommand('unshift', value),

  /**
   * 从数组末尾移除元素操作符
   * @returns DbMutateCommand 变更命令对象
   */
  pop: () => new DbMutateCommand('pop', undefined),

  /**
   * 从数组开头移除元素操作符
   * @returns DbMutateCommand 变更命令对象
   */
  shift: () => new DbMutateCommand('shift', undefined),

  /**
   * 移除字段操作符
   * @returns DbMutateCommand 变更命令对象
   */
  remove: () => new DbMutateCommand('remove', undefined),
};
