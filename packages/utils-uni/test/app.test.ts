import { onHide, onShow } from '@dcloudio/uni-app';
import { describe, expect, it, vi } from 'vitest';
import { useAppShow } from '@/client';

beforeAll(() => {
  vi.mock('@dcloudio/uni-app');
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('useAppShow', () => {
  it('应该在应用显示时正确执行回调函数', () => {
    const mockAppShow = vi.fn();
    const mockOnShow = vi.fn();
    const mockOnHide = vi.fn();

    vi.mocked(onShow).mockImplementation(mockOnShow);
    vi.mocked(onHide).mockImplementation(mockOnHide);

    // 调用 hook
    useAppShow(mockAppShow);

    // 验证 onShow 被调用
    expect(mockOnShow).toHaveBeenCalledTimes(1);

    // 触发模拟的 onShow 回调
    mockOnShow.mock.calls[0][0]();

    // 验证 appShow 回调被执行
    expect(mockAppShow).toHaveBeenCalledTimes(1);
  });

  it('应该在应用隐藏时正确执行清理函数', async () => {
    const cleanup = vi.fn();
    const mockAppShow = vi.fn(() => cleanup);
    const mockOnShow = vi.fn();
    const mockOnHide = vi.fn();

    vi.mocked(onShow).mockImplementation(mockOnShow);
    vi.mocked(onHide).mockImplementation(mockOnHide);

    // 调用 hook
    useAppShow(mockAppShow);

    // 触发模拟的 onShow 回调
    await mockOnShow.mock.calls[0][0]();

    // 验证 appShow 回调被执行
    expect(mockAppShow).toHaveBeenCalledTimes(1);

    // 触发模拟的 onHide 回调
    mockOnHide.mock.calls[0][0]();

    // 验证清理函数被执行
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('应该支持异步回调函数', async () => {
    const cleanup = vi.fn();
    const mockAppShow = vi.fn(async () => cleanup);
    const mockOnShow = vi.fn();
    const mockOnHide = vi.fn();

    vi.mocked(onShow).mockImplementation(mockOnShow);
    vi.mocked(onHide).mockImplementation(mockOnHide);

    // 调用 hook
    useAppShow(mockAppShow);

    // 触发模拟的 onShow 回调
    await mockOnShow.mock.calls[0][0]();

    // 验证 appShow 回调被执行
    expect(mockAppShow).toHaveBeenCalledTimes(1);

    // 触发模拟的 onHide 回调
    mockOnHide.mock.calls[0][0]();

    // 验证清理函数被执行
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
