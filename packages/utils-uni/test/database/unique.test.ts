import type { DbProxy } from '@/database/proxy';
import { describe, expect, it, vi } from 'vitest';
import { createMockData } from './_helpers';

const { mockUniCloud } = createMockData();

describe('dbUnique', () => {
  beforeAll(() => {
    // @ts-ignore
    global.uniCloud = mockUniCloud;
  });

  afterAll(() => {
    // @ts-ignore
    // biome-ignore lint/performance/noDelete: <explanation>
    delete global.uniCloud;
  });

  it('应该在找到记录时跳过更新操作（因为dbUnique不执行更新）', async () => {
    const { dbUnique } = await import('../../src/database');
    const existingRecord = { _id: '1', name: 'test', value: 10 };
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

    const onBeforeCreate = vi.fn();
    const onAfterCreate = vi.fn();
    const result = await dbUnique(dbProxy, {
      where: { name: 'test' },
      create: { name: 'test', value: 10 },
      onBeforeCreate,
      onAfterCreate,
    });

    // dbUnique 不应该执行更新操作
    expect(dbProxy.whereId).not.toHaveBeenCalled();
    expect(dbProxy.update).not.toHaveBeenCalled();

    // 应该执行查询操作
    expect(dbProxy.where).toHaveBeenCalledWith({ name: 'test' });
    expect(dbProxy.select).toHaveBeenCalledWith({});
    expect(dbProxy.queryOne).toHaveBeenCalledWith(true);

    // 因为找到了记录，不应该执行创建操作
    expect(dbProxy.create).not.toHaveBeenCalled();
    expect(onBeforeCreate).not.toHaveBeenCalled();
    expect(onAfterCreate).not.toHaveBeenCalled();

    // 返回结果应该表示没有创建新记录
    expect(result).toEqual({ id: existingRecord._id, created: false });
  });

  it('应该在未找到记录时执行创建操作', async () => {
    const { dbUnique } = await import('../../src/database');
    const newRecordId = '2';
    const dbProxy = {
      where: vi.fn().mockReturnThis(),
      whereId: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      queryOne: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue(newRecordId),
      update: vi.fn().mockResolvedValue({ updated: 1 }),
    } as unknown as DbProxy<{
      name: string;
      value: number;
    }>;

    const onBeforeCreate = vi.fn();
    const onAfterCreate = vi.fn();
    const result = await dbUnique(dbProxy, {
      where: { name: 'test' },
      create: { name: 'test', value: 10 },
      onBeforeCreate,
      onAfterCreate,
    });

    // dbUnique 不应该执行更新操作
    expect(dbProxy.whereId).not.toHaveBeenCalled();
    expect(dbProxy.update).not.toHaveBeenCalled();

    // 应该执行查询操作
    expect(dbProxy.where).toHaveBeenCalledWith({ name: 'test' });
    expect(dbProxy.select).toHaveBeenCalledWith({});
    expect(dbProxy.queryOne).toHaveBeenCalledWith(true);

    // 因为未找到记录，应该执行创建操作
    expect(dbProxy.create).toHaveBeenCalledWith({ name: 'test', value: 10 });
    expect(onBeforeCreate).toHaveBeenCalled();
    expect(onAfterCreate).toHaveBeenCalledWith(newRecordId);

    // 返回结果应该表示创建了新记录
    expect(result).toEqual({ id: newRecordId, created: true });
  });
});
