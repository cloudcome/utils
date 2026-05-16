import { describe, expect, it, vi } from 'vitest';
import { querySelectorRects } from '@/client';
import type { AnyFunction } from '@cloudcome/utils-core/types';

describe('querySelectorRects', () => {
  let mockCallback: any;

  const mockExec = vi.fn<AnyFunction>();
  const mockBoundingClientRect = vi.fn<AnyFunction>().mockImplementation((cb: any) => {
    mockCallback = cb;
    return { exec: mockExec };
  });
  const mockSelectAll = vi.fn<AnyFunction>().mockReturnValue({
    boundingClientRect: mockBoundingClientRect,
  });
  const mockIn = vi.fn<AnyFunction>().mockReturnValue({
    selectAll: mockSelectAll,
  });
  const mockCreateSelectorQuery = vi.fn<AnyFunction>().mockReturnValue({
    in: mockIn,
  });

  beforeAll(() => {
    // @ts-expect-error
    global.uni = {
      createSelectorQuery: mockCreateSelectorQuery,
    };
  });

  afterAll(() => {
    // @ts-expect-error
    delete global.uni;
  });

  beforeEach(() => {
    mockExec.mockReset();
    mockBoundingClientRect.mockClear();
    mockSelectAll.mockClear();
    mockIn.mockClear();
    mockCreateSelectorQuery.mockClear();
    mockCallback = null;

    mockBoundingClientRect.mockImplementation((cb: any) => {
      mockCallback = cb;
      return { exec: mockExec };
    });
  });

  it('应该返回元素的矩形信息', async () => {
    const mockRects = [{ left: 10, top: 20, width: 100, height: 50 }];

    mockExec.mockImplementation(() => {
      mockCallback(mockRects);
    });

    const instance = { proxy: {} } as any;
    const resultPromise = querySelectorRects(instance, '.test-selector');

    const result = await resultPromise;

    expect(result).toEqual([{ left: 10, top: 20, width: 100, height: 50 }]);
    expect(mockCreateSelectorQuery).toHaveBeenCalled();
    expect(mockIn).toHaveBeenCalledWith(instance.proxy);
    expect(mockSelectAll).toHaveBeenCalledWith('.test-selector');
  });

  it('应该返回多个元素的矩形信息', async () => {
    const mockRects = [
      { left: 10, top: 20, width: 100, height: 50 },
      { left: 200, top: 300, width: 150, height: 75 },
    ];

    mockExec.mockImplementation(() => {
      mockCallback(mockRects);
    });

    const instance = { proxy: {} } as any;
    const result = await querySelectorRects(instance, '.items');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ left: 10, top: 20, width: 100, height: 50 });
    expect(result[1]).toEqual({ left: 200, top: 300, width: 150, height: 75 });
  });

  it('应该在属性缺失时使用默认值0', async () => {
    const mockRects = [{ left: undefined, top: undefined, width: undefined, height: undefined }];

    mockExec.mockImplementation(() => {
      mockCallback(mockRects);
    });

    const instance = { proxy: {} } as any;
    const result = await querySelectorRects(instance, '.empty');

    expect(result).toEqual([{ left: 0, top: 0, width: 0, height: 0 }]);
  });

  it('应该在没有匹配元素时返回空数组', async () => {
    mockExec.mockImplementation(() => {
      mockCallback([]);
    });

    const instance = { proxy: {} } as any;
    const result = await querySelectorRects(instance, '.non-existent');

    expect(result).toEqual([]);
  });
});
