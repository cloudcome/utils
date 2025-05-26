import { onLoad } from '@dcloudio/uni-app';
import { describe, expect, it, vi } from 'vitest';
import { isReactive } from 'vue';
import { usePageQuery } from '../src/hook-page';

beforeAll(() => {
  vi.mock('@dcloudio/uni-app');
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('usePageQuery', () => {
  it('应该正确获取页面参数', () => {
    // 模拟 uni-app 的 onLoad 函数
    const mockOnLoad = vi.fn();
    vi.mocked(onLoad).mockImplementation(mockOnLoad);

    // 调用 hook
    const query = usePageQuery();

    // 触发模拟的 onLoad 回调
    const pageParams = { id: '123', name: 'test' };
    mockOnLoad.mock.calls[0][0](pageParams);

    // 验证结果
    expect(query).toEqual(pageParams);
  });

  it('应该正确执行传入的 onLoad 回调', () => {
    const mockCallback = vi.fn();
    const mockOnLoad = vi.fn();
    vi.mocked(onLoad).mockImplementation(mockOnLoad);

    // 调用 hook 并传入回调
    usePageQuery(mockCallback);

    // 触发模拟的 onLoad 回调
    const pageParams = { id: '123' };
    mockOnLoad.mock.calls[0][0](pageParams);

    // 验证回调被执行
    expect(mockCallback).toHaveBeenCalledWith(pageParams);
  });

  it('返回的 query 应该是响应式对象', () => {
    const query = usePageQuery();

    // 验证响应性
    expect(isReactive(query)).toBe(true);
  });
});
