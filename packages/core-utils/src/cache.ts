import { type TDateValue, dateParse } from './date/core';
import type { MaybePromise } from './types';

/**
 * 缓存选项接口
 */
export interface ICacheOptions {
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

export interface ICacheClass<T> {
  get(id: string): MaybePromise<ICached<T> | null>;

  set(id: string, data: T, options?: ICacheOptions): MaybePromise<void>;

  del(id: string): MaybePromise<void>;
}

/**
 * 缓存抽象类
 * @template T 缓存数据的类型
 */
export class AbstractCache<T> implements ICacheClass<T> {
  isExpired(cached: ICached<T>) {
    return cached.expiredAt > 0 && Date.now() > cached.expiredAt;
  }

  normalizeCached(id: string, data: T, options?: ICacheOptions): ICached<T> {
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
   */
  set(id: string, data: T, options?: ICacheOptions): MaybePromise<void> {
    //
  }

  /**
   * 删除缓存项
   * @param id 缓存项的唯一标识
   */
  del(id: string): MaybePromise<void> {
    //
  }
}

/**
 * 内存缓存实现类
 * @template T 缓存数据的类型
 */
export class MemoryCache<T> extends AbstractCache<T> {
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

  set(id: string, data: T, options?: ICacheOptions) {
    this.cache.set(id, this.normalizeCached(id, data, options));
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
