export type UniClientDatabaseOutput<T> = {
  result: T & {
    code?: number | string;
    errCode?: number | string;
    errMsg?: string;
    message?: string;
  };
};

export type UniCloudDatabaseOutput<T> = T;

export type UniDatabaseQueryCommand = { _: never };
export type UniDatabaseMutateCommand = { _: never };

/**
 * UniDatabaseCommand 数据库操作命令类型定义
 */
export type UniDatabaseCommand = {
  /**
   * 聚合表达式操作符
   * @param expr 表达式参数
   * @returns 返回聚合表达式结果
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#dbcmd-expr expr 文档}
   */
  expr: (expr: unknown) => UniDatabaseQueryCommand;

  /**
   * 等于操作符
   * @param value 比较值
   * @returns 返回查询条件
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#dbcmd-eq eq 文档}
   */
  eq: (value: unknown) => UniDatabaseQueryCommand;

  /**
   * 不等于操作符
   * @param value 比较值
   * @returns 返回查询条件
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#dbcmd-neq neq 文档}
   */
  neq: (value: unknown) => UniDatabaseQueryCommand;

  /**
   * 大于操作符
   * @param value 比较值
   * @returns 返回查询条件
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#dbcmd-gt gt 文档}
   */
  gt: (value: unknown) => UniDatabaseQueryCommand;

  /**
   * 大于等于操作符
   * @param value 比较值
   * @returns 返回查询条件
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#dbcmd-gte gte 文档}
   */
  gte: (value: unknown) => UniDatabaseQueryCommand;

  /**
   * 小于操作符
   * @param value 比较值
   * @returns 返回查询条件
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#dbcmd-lt lt 文档}
   */
  lt: (value: unknown) => UniDatabaseQueryCommand;

  /**
   * 小于等于操作符
   * @param value 比较值
   * @returns 返回查询条件
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#dbcmd-lte lte 文档}
   */
  lte: (value: unknown) => UniDatabaseQueryCommand;

  /**
   * 包含在数组内操作符
   * @param value 包含的值数组
   * @returns 返回查询条件
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#dbcmd-in in 文档}
   */
  in: (value: unknown[]) => UniDatabaseQueryCommand;

  /**
   * 不包含在数组内操作符
   * @param value 不包含的值数组
   * @returns 返回查询条件
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#dbcmd-nin nin 文档}
   */
  nin: (value: unknown[]) => UniDatabaseQueryCommand;

  /**
   * 逻辑与操作符
   * @param args 多个查询条件
   * @returns 返回逻辑与查询条件
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#dbcmd-and and 文档}
   */
  and: (...args: unknown[]) => UniDatabaseQueryCommand;

  /**
   * 逻辑或操作符
   * @param args 多个查询条件
   * @returns 返回逻辑或查询条件
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#dbcmd-or or 文档}
   */
  or: (...args: unknown[]) => UniDatabaseQueryCommand;

  /**
   * 自增操作符
   * @param value 增加的数值
   * @returns 返回更新操作
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#operator-inc inc 文档}
   */
  inc: (value: number) => UniDatabaseMutateCommand;

  /**
   * 自乘操作符
   * @param value 相乘的数值
   * @returns 返回更新操作
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#operator-mul mul 文档}
   */
  mul: (value: number) => UniDatabaseMutateCommand;

  /**
   * 设置字段值操作符
   * @param value 设置的值
   * @returns 返回更新操作
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#operator-set set 文档}
   */
  set: (value: unknown) => UniDatabaseMutateCommand;

  /**
   * 数组末尾添加元素操作符
   * @param value 添加的值
   * @returns 返回更新操作
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#operator-push push 文档}
   */
  push: (value: unknown) => UniDatabaseMutateCommand;

  /**
   * 数组开头添加元素操作符
   * @param value 添加的值
   * @returns 返回更新操作
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#operator-unshift unshift 文档}
   */
  unshift: (value: unknown) => UniDatabaseMutateCommand;

  /**
   * 删除数组末尾元素操作符
   * @returns 返回更新操作
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#operator-pop pop 文档}
   */
  pop: () => UniDatabaseMutateCommand;

  /**
   * 删除数组开头元素操作符
   * @returns 返回更新操作
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#operator-shift shift 文档}
   */
  shift: () => UniDatabaseMutateCommand;

  /**
   * 删除字段操作符
   * @returns 返回更新操作
   * @see {@link https://doc.dcloud.net.cn/uniCloud/cf-database.html#operator-remove remove 文档}
   */
  remove: () => UniDatabaseMutateCommand;
};
