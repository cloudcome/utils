import { isFunction } from '@cloudcome/utils-core/type';
import { Db } from './_db.class';
import type { DbSelect } from './types';
import type { UniError } from '@/_types';

export type DbProxyOptions = {
  /**
   * 自定义错误处理函数
   * @param error DbError 数据库异常对象
   * @returns 自定义错误对象
   */
  parseError?: (error: unknown) => UniError;
};

/**
 * 创建一个数据库代理对象，用于延迟实例化数据库操作类
 * @template D1 - 主表数据
 * @template S1 - 主表筛选
 * @param name - 数据库表名
 * @returns 返回一个代理对象，该对象会将属性访问转发到实际的数据库操作实例
 */

// biome-ignore lint/complexity/noBannedTypes: 必须这么用
export function dbProxy<D1, S1 extends DbSelect<D1> = {}>(name: string, options?: DbProxyOptions) {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === '_isProxy') return true;

        const table = new Db<D1, S1>({ table: name, ...options });
        const tableProp = prop as keyof Db<D1, S1>;
        const ref = table[tableProp];

        return isFunction(ref) ? ref.bind(table) : ref;
      },
    },
  ) as Db<D1, S1>;
}
