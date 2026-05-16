import { describe, expect, it, vi } from 'vitest';
import type { AnyFunction } from '@cloudcome/utils-core/types';
import { createMockData } from './_helpers';

const { mockUniCloud } = createMockData();

describe('dbPaging', () => {
  beforeAll(() => {
    // @ts-expect-error
    global.uniCloud = mockUniCloud;
  });

  afterAll(() => {
    // @ts-expect-error
    delete global.uniCloud;
  });

  it('应该返回列表和总数', async () => {
    const { dbPaging } = await import('../../src/database');

    const list = [
      { _id: '1', name: 'a' },
      { _id: '2', name: 'b' },
    ];

    const queryDb = {
      getWhere: vi.fn<AnyFunction>().mockReturnValue({ status: 'active' }),
      clone: vi.fn<AnyFunction>().mockReturnThis(),
      many: vi.fn<AnyFunction>().mockResolvedValue(list),
      where: vi.fn<AnyFunction>().mockReturnThis(),
      count: vi.fn<AnyFunction>().mockResolvedValue(2),
    };

    const result = await dbPaging(queryDb as any);

    expect(result).toEqual({ list, total: 2 });
    expect(queryDb.many).toHaveBeenCalled();
    expect(queryDb.clone).toHaveBeenCalled();
    expect(queryDb.where).toHaveBeenCalledWith({ status: 'active' });
  });

  it('应该在没有数据时返回空列表', async () => {
    const { dbPaging } = await import('../../src/database');

    const queryDb = {
      getWhere: vi.fn<AnyFunction>().mockReturnValue({}),
      clone: vi.fn<AnyFunction>().mockReturnThis(),
      many: vi.fn<AnyFunction>().mockResolvedValue([]),
      where: vi.fn<AnyFunction>().mockReturnThis(),
      count: vi.fn<AnyFunction>().mockResolvedValue(0),
    };

    const result = await dbPaging(queryDb as any);

    expect(result).toEqual({ list: [], total: 0 });
  });

  it('应该使用 getWhere(true) 获取原始查询条件用于计数', async () => {
    const { dbPaging } = await import('../../src/database');

    const queryDb = {
      getWhere: vi.fn<AnyFunction>().mockReturnValue({ name: 'test' }),
      clone: vi.fn<AnyFunction>().mockReturnThis(),
      many: vi.fn<AnyFunction>().mockResolvedValue([]),
      where: vi.fn<AnyFunction>().mockReturnThis(),
      count: vi.fn<AnyFunction>().mockResolvedValue(0),
    };

    await dbPaging(queryDb as any);

    expect(queryDb.getWhere).toHaveBeenCalledWith(true);
  });

  it('应该在克隆的实例上执行 count 操作', async () => {
    const { dbPaging } = await import('../../src/database');

    const clonedDb = {
      where: vi.fn<AnyFunction>().mockReturnThis(),
      count: vi.fn<AnyFunction>().mockResolvedValue(5),
    };

    const queryDb = {
      getWhere: vi.fn<AnyFunction>().mockReturnValue({}),
      clone: vi.fn<AnyFunction>().mockReturnValue(clonedDb),
      many: vi.fn<AnyFunction>().mockResolvedValue([]),
    };

    await dbPaging(queryDb as any);

    expect(queryDb.clone).toHaveBeenCalled();
    expect(clonedDb.where).toHaveBeenCalled();
    expect(clonedDb.count).toHaveBeenCalled();
  });

  it('应该支持带 select 和 where 条件的查询', async () => {
    const { dbPaging } = await import('../../src/database');

    const list = [{ _id: '1', nickname: 'test' }];

    const queryDb = {
      getWhere: vi.fn<AnyFunction>().mockReturnValue({ age: { $gt: 18 } }),
      clone: vi.fn<AnyFunction>().mockReturnThis(),
      many: vi.fn<AnyFunction>().mockResolvedValue(list),
      where: vi.fn<AnyFunction>().mockReturnThis(),
      count: vi.fn<AnyFunction>().mockResolvedValue(1),
    };

    const result = await dbPaging(queryDb as any);

    expect(result).toEqual({ list, total: 1 });
    expect(queryDb.where).toHaveBeenCalledWith({ age: { $gt: 18 } });
  });
});
