import { onLoad, onUnload } from '@dcloudio/uni-app';
import { describe, expect, it, vi } from 'vitest';
import { isReactive } from 'vue';
import { usePageLoad, usePageQuery } from '../src/page';

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

describe('usePageLoad', () => {
  it('应该在页面加载时正确执行回调函数', () => {
    const mockLoad = vi.fn();
    const mockOnLoad = vi.fn();
    const mockOnUnload = vi.fn();

    vi.mocked(onLoad).mockImplementation(mockOnLoad);
    vi.mocked(onUnload).mockImplementation(mockOnUnload);

    // 调用 hook
    usePageLoad(mockLoad);

    // 验证 onLoad 被调用
    expect(mockOnLoad).toHaveBeenCalledTimes(1);

    // 触发模拟的 onLoad 回调
    mockOnLoad.mock.calls[0][0]();

    // 验证 load 回调被执行
    expect(mockLoad).toHaveBeenCalledTimes(1);
  });

  it('应该在页面卸载时正确执行清理函数', async () => {
    const cleanup = vi.fn();
    const mockLoad = vi.fn(() => cleanup);
    const mockOnLoad = vi.fn();
    const mockOnUnload = vi.fn();

    vi.mocked(onLoad).mockImplementation(mockOnLoad);
    vi.mocked(onUnload).mockImplementation(mockOnUnload);

    // 调用 hook
    usePageLoad(mockLoad);

    // 触发模拟的 onLoad 回调
    await mockOnLoad.mock.calls[0][0]();

    // 验证 load 回调被执行
    expect(mockLoad).toHaveBeenCalledTimes(1);

    // 触发模拟的 onUnload 回调
    mockOnUnload.mock.calls[0][0]();

    // 验证清理函数被执行
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('应该支持异步回调函数', async () => {
    const cleanup = vi.fn();
    const mockLoad = vi.fn(async () => cleanup);
    const mockOnLoad = vi.fn();
    const mockOnUnload = vi.fn();

    vi.mocked(onLoad).mockImplementation(mockOnLoad);
    vi.mocked(onUnload).mockImplementation(mockOnUnload);

    // 调用 hook
    usePageLoad(mockLoad);

    // 触发模拟的 onLoad 回调
    await mockOnLoad.mock.calls[0][0]();

    // 验证 load 回调被执行
    expect(mockLoad).toHaveBeenCalledTimes(1);

    // 触发模拟的 onUnload 回调
    mockOnUnload.mock.calls[0][0]();

    // 验证清理函数被执行
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
