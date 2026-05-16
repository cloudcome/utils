import { describe, expect, it, vi } from 'vitest';
import type { AnyFunction } from '@cloudcome/utils-core/types';
import type { Db } from '@/database';
import { createMockData } from './_helpers';

const { mockUniCloud } = createMockData();

describe('dbUpsert', () => {
  beforeAll(() => {
    // @ts-expect-error
    global.uniCloud = mockUniCloud;
  });

  afterAll(() => {
    // @ts-expect-error
    delete global.uniCloud;
  });

  it('应该在找到记录时执行更新操作', async () => {
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const { dbUpsert } = await import('../../src/database');
    const dbProxy = {
      where: vi.fn<AnyFunction>().mockReturnThis(),
      whereId: vi.fn<AnyFunction>().mockReturnThis(),
      select: vi.fn<AnyFunction>().mockReturnThis(),
      firstOrNull: vi.fn<AnyFunction>().mockResolvedValue(existingRecord),
      create: vi.fn<AnyFunction>().mockResolvedValue(existingRecord._id),
      update: vi.fn<AnyFunction>().mockResolvedValue({ updated: 1 }),
      getWhere: vi.fn<AnyFunction>().mockReturnValue({}),
      clone: vi.fn<AnyFunction>().mockReturnThis(),
    } as unknown as Db<{
      name: string;
      value: number;
    }>;

    const onBeforeUpdate = vi.fn<AnyFunction>();
    const onAfterUpdate = vi.fn<AnyFunction>();
    const result = await dbUpsert(dbProxy, {
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      onBeforeUpdate,
      onAfterUpdate,
    });

    expect(dbProxy.whereId).toHaveBeenCalledWith(existingRecord._id);
    expect(dbProxy.firstOrNull).toHaveBeenCalled();
    expect(dbProxy.create).not.toHaveBeenCalled();
    expect(dbProxy.update).toHaveBeenCalledWith({ value: 20 });
    expect(result).toEqual({
      id: existingRecord._id,
      created: false,
      updated: true,
    });
    expect(onBeforeUpdate).toHaveBeenCalledWith(existingRecord);
    expect(onAfterUpdate).toHaveBeenCalledWith({ value: 20 }, existingRecord);
  });

  it('应该在找到记录时支持函数形式的更新操作', async () => {
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const { dbUpsert } = await import('../../src/database');
    const dbProxy = {
      where: vi.fn<AnyFunction>().mockReturnThis(),
      whereId: vi.fn<AnyFunction>().mockReturnThis(),
      select: vi.fn<AnyFunction>().mockReturnThis(),
      firstOrNull: vi.fn<AnyFunction>().mockResolvedValue(existingRecord),
      create: vi.fn<AnyFunction>().mockResolvedValue(existingRecord._id),
      update: vi.fn<AnyFunction>().mockResolvedValue({ updated: 1 }),
      getWhere: vi.fn<AnyFunction>().mockReturnValue({}),
      clone: vi.fn<AnyFunction>().mockReturnThis(),
    } as unknown as Db<{
      name: string;
      value: number;
    }>;

    const onBeforeUpdate = vi.fn<AnyFunction>();
    const onAfterUpdate = vi.fn<AnyFunction>();
    const result = await dbUpsert(dbProxy, {
      create: { name: 'test', value: 10 },
      update: (data) => ({ value: data.value + 20 }),
      onBeforeUpdate,
      onAfterUpdate,
    });

    expect(dbProxy.whereId).toHaveBeenCalledWith(existingRecord._id);
    expect(dbProxy.firstOrNull).toHaveBeenCalled();
    expect(dbProxy.create).not.toHaveBeenCalled();
    expect(dbProxy.update).toHaveBeenCalledWith({ value: 30 });
    expect(result).toEqual({
      id: existingRecord._id,
      created: false,
      updated: true,
    });
    expect(onBeforeUpdate).toHaveBeenCalledWith(existingRecord);
    expect(onAfterUpdate).toHaveBeenCalledWith({ value: 30 }, existingRecord);
  });

  it('应该在未找到记录时执行创建操作', async () => {
    const { dbUpsert } = await import('../../src/database');
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const dbProxy = {
      where: vi.fn<AnyFunction>().mockReturnThis(),
      whereId: vi.fn<AnyFunction>().mockReturnThis(),
      select: vi.fn<AnyFunction>().mockReturnThis(),
      firstOrNull: vi.fn<AnyFunction>().mockResolvedValue(undefined),
      create: vi.fn<AnyFunction>().mockResolvedValue(existingRecord._id),
      update: vi.fn<AnyFunction>().mockResolvedValue({ updated: 1 }),
      getWhere: vi.fn<AnyFunction>().mockReturnValue({}),
      clone: vi.fn<AnyFunction>().mockReturnThis(),
    } as unknown as Db<{
      name: string;
      value: number;
    }>;

    const onBeforeCreate = vi.fn<AnyFunction>();
    const onAfterCreate = vi.fn<AnyFunction>();
    const result = await dbUpsert(dbProxy, {
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      onBeforeCreate,
      onAfterCreate,
    });

    expect(dbProxy.whereId).not.toHaveBeenCalled();
    expect(dbProxy.firstOrNull).toHaveBeenCalled();
    expect(dbProxy.create).toHaveBeenCalled();
    expect(dbProxy.update).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: existingRecord._id,
      created: true,
      updated: false,
    });
    expect(onBeforeCreate).toHaveBeenCalled();
    expect(onAfterCreate).toHaveBeenCalledWith(existingRecord._id);
  });

  it('应该在onBeforeUpdate返回false时跳过更新操作', async () => {
    const existingRecord = { _id: '1', name: 'test', value: 10 };
    const { dbUpsert } = await import('../../src/database');
    const dbProxy = {
      where: vi.fn<AnyFunction>().mockReturnThis(),
      whereId: vi.fn<AnyFunction>().mockReturnThis(),
      select: vi.fn<AnyFunction>().mockReturnThis(),
      firstOrNull: vi.fn<AnyFunction>().mockResolvedValue(existingRecord),
      create: vi.fn<AnyFunction>().mockResolvedValue(existingRecord._id),
      update: vi.fn<AnyFunction>().mockResolvedValue({ updated: 1 }),
      getWhere: vi.fn<AnyFunction>().mockReturnValue({}),
      clone: vi.fn<AnyFunction>().mockReturnThis(),
    } as unknown as Db<{
      name: string;
      value: number;
    }>;

    const onBeforeUpdate = vi.fn<AnyFunction>().mockResolvedValue(false);
    const onAfterUpdate = vi.fn<AnyFunction>();
    const result = await dbUpsert(dbProxy, {
      create: { name: 'test', value: 10 },
      update: { value: 20 },
      onBeforeUpdate,
      onAfterUpdate,
    });

    expect(dbProxy.whereId).not.toHaveBeenCalled();
    expect(dbProxy.firstOrNull).toHaveBeenCalled();
    expect(dbProxy.create).not.toHaveBeenCalled();
    expect(dbProxy.update).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: existingRecord._id,
      created: false,
      updated: false,
    });
    expect(onBeforeUpdate).toHaveBeenCalledWith(existingRecord);
    expect(onAfterUpdate).not.toHaveBeenCalled();
  });
});
