import type { DbProxy } from '@/database/proxy';
import { objectEach } from '@cloudcome/utils-core/object';
import { describe, expect, it, vi } from 'vitest';
import { createMockData } from './_helpers';

const { mockUniCloud } = createMockData();

describe('dbUpsert', () => {
  beforeAll(() => {
    // @ts-ignore
    global.uniCloud = mockUniCloud;
  });

  afterAll(() => {
    // @ts-ignore
    // biome-ignore lint/performance/noDelete: <explanation>
    delete global.uniCloud;
  });

  it('应该在找到记录时执行更新操作', async () => {
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const { dbUpsert } = await import('../../src/database');
    const dbProxy = {
      where: vi.fn().mockReturnThis(),
      whereId: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      queryOne: vi.fn().mockResolvedValue(existingRecord),
      create: vi.fn().mockResolvedValue(existingRecord._id),
      update: vi.fn().mockResolvedValue({ updated: 1 }),
    } as unknown as DbProxy<{
      name: string;
      value: number;
    }>;

    const onBeforeUpdate = vi.fn();
    const onAfterUpdate = vi.fn();
    const result = await dbUpsert(dbProxy, {
      where: { name: 'test' },
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      onBeforeUpdate,
      onAfterUpdate,
    });

    expect(dbProxy.whereId).toHaveBeenCalledWith(existingRecord._id);
    expect(dbProxy.where).toHaveBeenCalledWith({ name: 'test' });
    expect(dbProxy.select).toHaveBeenCalledWith({ name: true, value: true });
    expect(dbProxy.queryOne).toHaveBeenCalledWith(true);
    expect(dbProxy.create).not.toHaveBeenCalled();
    expect(dbProxy.update).toHaveBeenCalledWith({ value: 20 });
    expect(result).toEqual({ id: existingRecord._id, created: false, updated: true });
    expect(onBeforeUpdate).toHaveBeenCalledWith(existingRecord);
    expect(onAfterUpdate).toHaveBeenCalledWith({ value: 20 }, existingRecord);
  });

  it('应该在找到记录时支持函数形式的更新操作', async () => {
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const { dbUpsert } = await import('../../src/database');
    const dbProxy = {
      where: vi.fn().mockReturnThis(),
      whereId: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      queryOne: vi.fn().mockResolvedValue(existingRecord),
      create: vi.fn().mockResolvedValue(existingRecord._id),
      update: vi.fn().mockResolvedValue({ updated: 1 }),
    } as unknown as DbProxy<{
      name: string;
      value: number;
    }>;

    const onBeforeUpdate = vi.fn();
    const onAfterUpdate = vi.fn();
    const result = await dbUpsert(dbProxy, {
      where: { name: 'test' },
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: (data) => ({ value: data.value + 20 }),
      onBeforeUpdate,
      onAfterUpdate,
    });

    expect(dbProxy.whereId).toHaveBeenCalledWith(existingRecord._id);
    expect(dbProxy.where).toHaveBeenCalledWith({ name: 'test' });
    expect(dbProxy.select).toHaveBeenCalledWith({ name: true, value: true });
    expect(dbProxy.queryOne).toHaveBeenCalledWith(true);
    expect(dbProxy.create).not.toHaveBeenCalled();
    expect(dbProxy.update).toHaveBeenCalledWith({ value: 30 });
    expect(result).toEqual({ id: existingRecord._id, created: false, updated: true });
    expect(onBeforeUpdate).toHaveBeenCalledWith(existingRecord);
    expect(onAfterUpdate).toHaveBeenCalledWith({ value: 30 }, existingRecord);
  });

  it('应该在未找到记录时执行创建操作', async () => {
    const { dbUpsert } = await import('../../src/database');
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const dbProxy = {
      where: vi.fn().mockReturnThis(),
      whereId: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      queryOne: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue(existingRecord._id),
      update: vi.fn().mockResolvedValue({ updated: 1 }),
    } as unknown as DbProxy<{
      name: string;
      value: number;
    }>;

    const onBeforeCreate = vi.fn();
    const onAfterCreate = vi.fn();
    const result = await dbUpsert(dbProxy, {
      where: { name: 'test' }, // 使用普通where查询
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      onBeforeCreate,
      onAfterCreate,
    });

    expect(dbProxy.whereId).not.toHaveBeenCalled();
    expect(dbProxy.where).toHaveBeenCalledWith({ name: 'test' });
    expect(dbProxy.select).toHaveBeenCalledWith({ name: true, value: true });
    expect(dbProxy.queryOne).toHaveBeenCalledWith(true);
    expect(dbProxy.create).toHaveBeenCalled();
    expect(dbProxy.update).not.toHaveBeenCalled();
    expect(result).toEqual({ id: existingRecord._id, created: true, updated: false });
    expect(onBeforeCreate).toHaveBeenCalled();
    expect(onAfterCreate).toHaveBeenCalledWith(existingRecord._id);
  });

  it('应该在onBeforeUpdate返回false时跳过更新操作', async () => {
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const { dbUpsert } = await import('../../src/database');
    const dbProxy = {
      where: vi.fn().mockReturnThis(),
      whereId: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      queryOne: vi.fn().mockResolvedValue(existingRecord),
      create: vi.fn().mockResolvedValue(existingRecord._id),
      update: vi.fn().mockResolvedValue({ updated: 1 }),
    } as unknown as DbProxy<{
      name: string;
      value: number;
    }>;

    const onBeforeUpdate = vi.fn().mockResolvedValue(false);
    const onAfterUpdate = vi.fn();
    const result = await dbUpsert(dbProxy, {
      where: { name: 'test' },
      select: { name: true, value: true },
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      onBeforeUpdate,
      onAfterUpdate,
    });

    expect(dbProxy.whereId).not.toHaveBeenCalled();
    expect(dbProxy.where).toHaveBeenCalledWith({ name: 'test' });
    expect(dbProxy.select).toHaveBeenCalledWith({ name: true, value: true });
    expect(dbProxy.queryOne).toHaveBeenCalledWith(true);
    expect(dbProxy.create).not.toHaveBeenCalled();
    expect(dbProxy.update).not.toHaveBeenCalled();
    expect(result).toEqual({ id: existingRecord._id, created: false, updated: false });
    expect(onBeforeUpdate).toHaveBeenCalledWith(existingRecord);
    expect(onAfterUpdate).not.toHaveBeenCalled();
  });
});
