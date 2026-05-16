import { describe, expect, it, vi } from 'vitest';
import type { AnyFunction } from '@cloudcome/utils-core/types';
import { createMockData } from './_helpers';

const { mockUniCloud } = createMockData();

describe('dbEach', () => {
  beforeAll(() => {
    // @ts-expect-error
    global.uniCloud = mockUniCloud;
  });

  afterAll(() => {
    // @ts-expect-error
    delete global.uniCloud;
  });

  it('应该遍历所有行并执行迭代器', async () => {
    const { dbEach } = await import('../../src/database');
    const rows = [
      { _id: '1', name: 'a' },
      { _id: '2', name: 'b' },
      { _id: '3', name: 'c' },
    ];
    const iterator = vi.fn<(row: (typeof rows)[0]) => Promise<void>>().mockResolvedValue(undefined);

    const whereChain: any = {
      count: vi.fn<() => Promise<number>>().mockResolvedValue(rows.length),
      limit: vi.fn<() => typeof whereChain>().mockReturnThis(),
      skip: vi.fn<() => typeof whereChain>().mockReturnThis(),
      many: vi.fn<() => Promise<typeof rows>>().mockResolvedValue(rows),
    };

    const table = {
      where: vi.fn<(where: object) => typeof whereChain>().mockReturnValue(whereChain),
    } as any;

    await dbEach(table, {}, iterator);

    expect(iterator).toHaveBeenCalledTimes(3);
    expect(iterator).toHaveBeenCalledWith(rows[0]);
    expect(iterator).toHaveBeenCalledWith(rows[1]);
    expect(iterator).toHaveBeenCalledWith(rows[2]);
  });

  it('应该在无数据时不执行迭代器', async () => {
    const { dbEach } = await import('../../src/database');
    const iterator = vi.fn<(row: any) => Promise<void>>().mockResolvedValue(undefined);

    const whereChain: any = {
      count: vi.fn<() => Promise<number>>().mockResolvedValue(0),
      limit: vi.fn<() => typeof whereChain>().mockReturnThis(),
      skip: vi.fn<() => typeof whereChain>().mockReturnThis(),
      many: vi.fn<() => Promise<any[]>>().mockResolvedValue([]),
    };

    const table = {
      where: vi.fn<(where: object) => typeof whereChain>().mockReturnValue(whereChain),
    } as any;

    await dbEach(table, {}, iterator);

    expect(iterator).not.toHaveBeenCalled();
  });

  it('应该支持 maxCount 参数限制遍历数量', async () => {
    const { dbEach } = await import('../../src/database');
    const totalRows = Array.from({ length: 250 }, (_, i) => ({
      _id: String(i),
      name: `item-${i}`,
    }));
    const iterator = vi.fn<AnyFunction>().mockResolvedValue(undefined);
    let currentSkip = 0;

    const whereChain: any = {
      count: vi.fn<AnyFunction>().mockResolvedValue(250),
      limit: vi.fn<AnyFunction>().mockReturnThis(),
      skip: vi.fn<AnyFunction>().mockImplementation((n: number) => {
        currentSkip = n;
        return whereChain;
      }),
      many: vi.fn<AnyFunction>().mockImplementation(() => {
        return totalRows.slice(currentSkip, currentSkip + 100);
      }),
    };

    const table = {
      where: vi.fn<AnyFunction>().mockReturnValue(whereChain),
    } as any;

    await dbEach(table, {}, iterator, 150);

    expect(whereChain.count).toHaveBeenCalled();
    expect(iterator).toHaveBeenCalledTimes(200);
  });

  it('应该在 maxCount 为 0 时不遍历任何数据', async () => {
    const { dbEach } = await import('../../src/database');
    const iterator = vi.fn<AnyFunction>().mockResolvedValue(undefined);

    const whereChain: any = {
      count: vi.fn<AnyFunction>().mockResolvedValue(100),
      limit: vi.fn<AnyFunction>().mockReturnThis(),
      skip: vi.fn<AnyFunction>().mockReturnThis(),
      many: vi.fn<AnyFunction>().mockResolvedValue([]),
    };

    const table = {
      where: vi.fn<AnyFunction>().mockReturnValue(whereChain),
    } as any;

    await dbEach(table, {}, iterator, 0);

    expect(iterator).not.toHaveBeenCalled();
  });

  it('应该分批遍历数据（每批100条）', async () => {
    const { dbEach } = await import('../../src/database');
    const batch1 = Array.from({ length: 100 }, (_, i) => ({
      _id: String(i),
      name: `item-${i}`,
    }));
    const batch2 = Array.from({ length: 50 }, (_, i) => ({
      _id: String(100 + i),
      name: `item-${100 + i}`,
    }));
    const iterator = vi.fn<AnyFunction>().mockResolvedValue(undefined);

    const whereChain: any = {
      count: vi.fn<AnyFunction>().mockResolvedValue(150),
      limit: vi.fn<AnyFunction>().mockReturnThis(),
      skip: vi.fn<AnyFunction>().mockReturnThis(),
      many: vi.fn<AnyFunction>().mockResolvedValueOnce(batch1).mockResolvedValueOnce(batch2),
    };

    const table = {
      where: vi.fn<AnyFunction>().mockReturnValue(whereChain),
    } as any;

    await dbEach(table, {}, iterator);

    expect(whereChain.many).toHaveBeenCalledTimes(2);
    expect(whereChain.limit).toHaveBeenCalledWith(100);
    expect(whereChain.skip).toHaveBeenCalledWith(0);
    expect(whereChain.skip).toHaveBeenCalledWith(100);
    expect(iterator).toHaveBeenCalledTimes(150);
  });

  it('应该按顺序等待每个迭代器完成', async () => {
    const { dbEach } = await import('../../src/database');
    const rows = [
      { _id: '1', name: 'a' },
      { _id: '2', name: 'b' },
    ];
    const callOrder: string[] = [];

    const iterator = vi.fn<(row: (typeof rows)[0]) => Promise<void>>().mockImplementation(async (row: any) => {
      callOrder.push(`start-${row._id}`);
      await new Promise((resolve) => setTimeout(resolve, 10));
      callOrder.push(`end-${row._id}`);
    });

    const whereChain: any = {
      count: vi.fn<() => Promise<number>>().mockResolvedValue(rows.length),
      limit: vi.fn<() => typeof whereChain>().mockReturnThis(),
      skip: vi.fn<() => typeof whereChain>().mockReturnThis(),
      many: vi.fn<() => Promise<typeof rows>>().mockResolvedValue(rows),
    };

    const table = {
      where: vi.fn<(where: object) => typeof whereChain>().mockReturnValue(whereChain),
    } as any;

    await dbEach(table, {}, iterator);

    expect(callOrder).toEqual(['start-1', 'end-1', 'start-2', 'end-2']);
  });

  it('应该正确传递 where 条件', async () => {
    const { dbEach } = await import('../../src/database');
    const where = { status: 'active' };
    const iterator = vi.fn<(row: any) => Promise<void>>().mockResolvedValue(undefined);

    const whereChain: any = {
      count: vi.fn<() => Promise<number>>().mockResolvedValue(0),
      limit: vi.fn<() => typeof whereChain>().mockReturnThis(),
      skip: vi.fn<() => typeof whereChain>().mockReturnThis(),
      many: vi.fn<() => Promise<any[]>>().mockResolvedValue([]),
    };

    const table = {
      where: vi.fn<(where: object) => typeof whereChain>().mockReturnValue(whereChain),
    } as any;

    await dbEach(table, where, iterator);

    expect(table.where).toHaveBeenCalledWith(where);
  });

  it('应该在 maxCount 大于实际数量时遍历所有数据', async () => {
    const { dbEach } = await import('../../src/database');
    const rows = [
      { _id: '1', name: 'a' },
      { _id: '2', name: 'b' },
    ];
    const iterator = vi.fn<(row: (typeof rows)[0]) => Promise<void>>().mockResolvedValue(undefined);

    const whereChain: any = {
      count: vi.fn<() => Promise<number>>().mockResolvedValue(2),
      limit: vi.fn<() => typeof whereChain>().mockReturnThis(),
      skip: vi.fn<() => typeof whereChain>().mockReturnThis(),
      many: vi.fn<() => Promise<typeof rows>>().mockResolvedValue(rows),
    };

    const table = {
      where: vi.fn<(where: object) => typeof whereChain>().mockReturnValue(whereChain),
    } as any;

    await dbEach(table, {}, iterator, 1000);

    expect(iterator).toHaveBeenCalledTimes(2);
  });

  it('应该支持迭代器返回不同类型的 Promise', async () => {
    const { dbEach } = await import('../../src/database');
    const rows = [{ _id: '1', value: 10 }];
    const results: number[] = [];

    const iterator = vi.fn<(row: (typeof rows)[0]) => Promise<void>>().mockImplementation(async (row: any) => {
      results.push(row.value * 2);
    });

    const whereChain: any = {
      count: vi.fn<() => Promise<number>>().mockResolvedValue(1),
      limit: vi.fn<() => typeof whereChain>().mockReturnThis(),
      skip: vi.fn<() => typeof whereChain>().mockReturnThis(),
      many: vi.fn<() => Promise<typeof rows>>().mockResolvedValue(rows),
    };

    const table = {
      where: vi.fn<(where: object) => typeof whereChain>().mockReturnValue(whereChain),
    } as any;

    await dbEach(table, {}, iterator);

    expect(results).toEqual([20]);
  });
});
