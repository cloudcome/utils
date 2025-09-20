import { isFunction } from '@cloudcome/utils-core/type';
import type { AnyObject } from '@cloudcome/utils-core/types';
import { Db, type DbSelect } from './db.class';

/**
 * DbProxy 类型定义，用于创建数据库代理对象
 * @template T - 数据库表的类型
 * @template S - 数据库选择器类型，默认为空对象
 * @template R - 数据库返回结果类型，默认为空对象
 */
// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type DbProxy<T, S extends DbSelect<T> = {}, R extends AnyObject = {}> = Db<T, S, R> & {
  _isProxy: true;
};

/**
 * 创建一个数据库代理对象，用于延迟实例化数据库操作类
 * @template T - 数据库表的类型
 * @template S - 数据库选择器类型，默认为空对象
 * @template R - 数据库返回结果类型，默认为空对象
 * @param name - 数据库表名
 * @returns 返回一个代理对象，该对象会将属性访问转发到实际的数据库操作实例
 */
// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function dbProxy<T, S extends DbSelect<T> = {}, R extends AnyObject = {}>(name: string) {
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
}
