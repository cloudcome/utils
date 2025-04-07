import type { MaybePromise } from './types';

/**
 * 缓存选项接口
 */
export interface CacheOptions {
  /**
   * 缓存的最大存活时间（毫秒）
   */
  maxAge?: number;
}

/**
 * 缓存项接口
 * @template T 缓存数据的类型
 */
export interface Cached<T> {
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
   * 缓存项的最大存活时间（毫秒）
   */
  maxAge: number;
}

/**
 * 抽象缓存接口
 * @template T 缓存数据的类型
 */
export interface AbstractCache<T> {
  /**
   * 获取缓存项
   * @param id 缓存项的唯一标识
   * @returns 返回缓存项或 null
   */
  get: (id: string) => MaybePromise<Cached<T> | null>;
  /**
   * 设置缓存项
   * @param id 缓存项的唯一标识
   * @param data 要缓存的数据
   * @param options 缓存选项
   * @returns 返回一个 Promise 或 void
   */
  set: (id: string, data: T, options?: CacheOptions) => MaybePromise<unknown>;
  /**
   * 删除缓存项
   * @param id 缓存项的唯一标识
   * @returns 返回一个 Promise 或 void
   */
  del: (id: string) => MaybePromise<unknown>;
}

/**
 * 内存缓存实现类
 * @template T 缓存数据的类型
 */
export class MemoryCache<T> implements AbstractCache<T> {
  private cache: Map<string, Cached<T>> = new Map();

  /**
   * 获取缓存项
   * @param id 缓存项的唯一标识
   * @returns 返回缓存项或 null
   */
  get(id: string) {
    const cached = this.cache.get(id);

    if (!cached) return null;

    if (cached.maxAge > 0 && Date.now() - cached.createdAt > cached.maxAge) {
      this.del(id);
      return null;
    }

    return cached;
  }

  /**
   * 设置缓存项
   * @param id 缓存项的唯一标识
   * @param data 要缓存的数据
   * @param options 缓存选项
   */
  set(id: string, data: T, options?: CacheOptions) {
    this.cache.set(id, {
      id,
      data,
      createdAt: Date.now(),
      maxAge: options?.maxAge || 0,
    });
  }

  /**
   * 删除缓存项
   * @param id 缓存项的唯一标识
   */
  del(id: string) {
    this.cache.delete(id);
  }
}
