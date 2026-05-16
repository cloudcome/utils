import { describe, expect, it, vi } from 'vitest';
import type { Db } from '@/database';
import { createMockData } from './_helpers';

const { mockUniCloud } = createMockData();

describe('dbUnique', () => {
  beforeAll(() => {
    // @ts-expect-error
    global.uniCloud = mockUniCloud;
  });

  afterAll(() => {
    // @ts-expect-error
    delete global.uniCloud;
  });

  it('应该在找到记录时跳过更新操作（因为dbUnique不执行更新）', async () => {
    const { dbUnique } = await import('../../src/database');
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const dbProxy = {
      where: vi.fn<() => void>().mockReturnThis(),
      whereId: vi.fn<() => void>().mockReturnThis(),
      select: vi.fn<() => void>().mockReturnThis(),
      firstOrNull: vi.fn<() => void>().mockResolvedValue(existingRecord),
      create: vi.fn<() => void>().mockResolvedValue(existingRecord._id),
      update: vi.fn<() => void>().mockResolvedValue({ updated: 1 }),
      clone: vi.fn<() => void>().mockReturnThis(),
      getWhere: vi.fn<() => void>().mockReturnValue({}),
    } as unknown as Db<{
      name: string;
      value: number;
    }>;

    const onBeforeCreate = vi.fn<() => void>();
    const onAfterCreate = vi.fn<() => void>();
    const result = await dbUnique(dbProxy, {
      create: { name: 'test', value: 10 },
      onBeforeCreate,
      onAfterCreate,
    });

    // dbUnique 不应该执行更新操作
    expect(dbProxy.whereId).not.toHaveBeenCalled();
    expect(dbProxy.update).not.toHaveBeenCalled();

    // 应该执行查询操作
    expect(dbProxy.firstOrNull).toHaveBeenCalled();

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
      where: vi.fn<() => void>().mockReturnThis(),
      whereId: vi.fn<() => void>().mockReturnThis(),
      select: vi.fn<() => void>().mockReturnThis(),
      firstOrNull: vi.fn<() => void>().mockResolvedValue(undefined),
      create: vi.fn<() => void>().mockResolvedValue(newRecordId),
      update: vi.fn<() => void>().mockResolvedValue({ updated: 1 }),
      clone: vi.fn<() => void>().mockReturnThis(),
      getWhere: vi.fn<() => void>().mockReturnValue({}),
    } as unknown as Db<{
      name: string;
      value: number;
    }>;

    const onBeforeCreate = vi.fn<() => void>();
    const onAfterCreate = vi.fn<() => void>();
    const result = await dbUnique(dbProxy, {
      create: { name: 'test', value: 10 },
      onBeforeCreate,
      onAfterCreate,
    });

    // dbUnique 不应该执行更新操作
    expect(dbProxy.whereId).not.toHaveBeenCalled();
    expect(dbProxy.update).not.toHaveBeenCalled();

    // 应该执行查询操作
    expect(dbProxy.firstOrNull).toHaveBeenCalled();

    // 因为未找到记录，应该执行创建操作
    expect(dbProxy.create).toHaveBeenCalledWith({ name: 'test', value: 10 });
    expect(onBeforeCreate).toHaveBeenCalled();
    expect(onAfterCreate).toHaveBeenCalledWith(newRecordId);

    // 返回结果应该表示创建了新记录
    expect(result).toEqual({ id: newRecordId, created: true });
  });
});
