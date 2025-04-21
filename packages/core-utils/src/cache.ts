import { type TDateValue, dateParse } from './date/core';
import type { MaybePromise } from './types';

/**
 * 缓存选项接口
 */
export interface CacheOptions {
  /**
   * 缓存的最大存活时长（毫秒）
   */
  maxAge?: number;

  /**
   * 缓存项的过期时间（时间戳）
   * 优先级比 maxAge 更高
   */
  expiredAt?: TDateValue;
}

/**
 * 缓存项接口
 * @template T 缓存数据的类型
 */
export interface ICached<T> {
  /**
   * 缓存项的唯一标识
   */
  id: string;
  /**
   * 缓存的数据
   */
  data: T;
  /**
   * 缓存项的创建时间（时间戳）
   */
  createdAt: number;
  /**
   * 缓存项的过期时间（时间戳）
   */
  expiredAt: number;
}

/**
 * 缓存基类
 * @template T 缓存数据的类型
 */
class BaseCache<T> {
  isExpired(cached: ICached<T>) {
    return cached.expiredAt > 0 && Date.now() > cached.expiredAt;
  }

  normalizeCached(id: string, data: T, options?: CacheOptions): ICached<T> {
    const { expiredAt = 0, maxAge = 0 } = options || {};
    const now = Date.now();
    return {
      id,
      data,
      createdAt: now,
      expiredAt: expiredAt ? dateParse(expiredAt).getTime() : maxAge > 0 ? now + maxAge : 0,
    };
  }

  /**
   * 获取缓存项
   * @param id 缓存项的唯一标识
   * @returns 返回缓存项或 null
   */
  get(id: string): MaybePromise<ICached<T> | null> {
    return null;
  }

  /**
   * 设置缓存项
   * @param id 缓存项的唯一标识
   * @param data 要缓存的数据
   * @param options 缓存选项
   * @returns 返回 true 表示缓存成功，否则失败
   */
  set(id: string, data: T, options?: CacheOptions): MaybePromise<boolean> {
    return false;
  }

  /**
   * 删除缓存项
   * @param id 缓存项的唯一标识
   * @returns 返回一个 Promise 或 void
   */
  del(id: string): MaybePromise<void> {
    //
  }
}

/**
 * 内存缓存实现类
 * @template T 缓存数据的类型
 */
export class MemoryCache<T> extends BaseCache<T> {
  private cache: Map<string, ICached<T>> = new Map();

  get(id: string) {
    const cached = this.cache.get(id);

    if (!cached) return null;

    if (this.isExpired(cached)) {
      this.del(id);
      return null;
    }

    return cached;
  }

  set(id: string, data: T, options?: CacheOptions) {
    this.cache.set(id, this.normalizeCached(id, data, options));
    return true;
  }

  del(id: string) {
    this.cache.delete(id);
  }
}

/**
 * 创建一个新的内存缓存实例
 * @template T 缓存数据的类型
 * @returns 返回一个新的 MemoryCache 实例
 */
export function createMemCache<T>() {
  return new MemoryCache<T>();
}
