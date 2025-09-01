import { type DateValue, dateParse } from './date';
import type { MaybePromise } from './types';

/**
 * 缓存选项
 */
export type CacheOptions = {
  /**
   * 缓存的最大时长（毫秒），为 0 时表示永久缓存
   */
  maxAge?: number;

  /**
   * 缓存的过期时间（时间戳、日期字符串、日期对象等）
   * 优先级比 maxAge 更高
   */
  expiredAt?: DateValue;
};

/**
 * 缓存项
 * @template T 缓存数据的类型
 */
export type Cached<T> = {
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
};

export type Cache<T> = {
  get(id: string): MaybePromise<Cached<T> | null>;

  set(id: string, data: T, options?: CacheOptions): MaybePromise<void>;

  del(id: string): MaybePromise<void>;
};

/**
 * 缓存抽象类
 * @template T 缓存数据的类型
 */
export class AbstractCache<T> implements Cache<T> {
  isExpired(cached: Cached<T>) {
    return cached.expiredAt > 0 && Date.now() > cached.expiredAt;
  }

  normalizeCached(id: string, data: T, options?: CacheOptions): Cached<T> {
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
  get(id: string): MaybePromise<Cached<T> | null> {
    return null;
  }

  /**
   * 设置缓存项
   * @param id 缓存项的唯一标识
   * @param data 要缓存的数据
   * @param options 缓存选项
   */
  set(id: string, data: T, options?: CacheOptions): MaybePromise<void> {
    //
  }

  /**
   * 删除缓存项
   * @param id 缓存项的唯一标识
   */
  del(id: string): MaybePromise<void> {
    //
  }

  /**
   * 清空缓存
   */
  clear(): MaybePromise<void> {
    //
  }
}

/**
 * 内存缓存实现类
 * @template T 缓存数据的类型
 */
export class MemoryCache<T> extends AbstractCache<T> {
  private cache: Map<string, Cached<T>> = new Map();

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
  }

  del(id: string) {
    this.cache.delete(id);
  }

  clear() {
    this.cache.clear();
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
