import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryCache, createMemCache } from '../src/cache';

describe('内存缓存', () => {
  let cache: MemoryCache<string>;

  beforeEach(() => {
    cache = createMemCache<string>();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该能够设置和获取缓存', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')?.data).toBe('value1');
  });

  it('获取不存在的缓存应该返回 null', () => {
    expect(cache.get('non-existent')).toBeNull();
  });

  it('应该能够删除缓存', () => {
    cache.set('key1', 'value1');
    cache.del('key1');
    expect(cache.get('key1')).toBeNull();
  });

  it('缓存过期后应该返回 null', () => {
    cache.set('key1', 'value1', { maxAge: 1000 });
    vi.advanceTimersByTime(1001);
    expect(cache.get('key1')).toBeNull();
  });

  it('未设置 maxAge 的缓存应该不会过期', () => {
    cache.set('key1', 'value1');
    vi.advanceTimersByTime(10000);
    expect(cache.get('key1')?.data).toBe('value1');
  });

  it('createMemCache 应该返回一个新的 MemoryCache 实例', () => {
    const newCache = createMemCache<string>();
    expect(newCache).toBeInstanceOf(MemoryCache);
  });
});
