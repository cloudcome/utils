import { describe, expect, it, vi } from 'vitest';
import { _runLifeHook } from '../src/shared';

describe('_runLifeHook', () => {
  it('应该在进入时正确执行回调函数', async () => {
    const mockEnterHook = vi.fn<() => void>();
    const mockLeaveHook = vi.fn<() => void>();
    const mockOnEnter = vi.fn<() => void>();

    // 调用 _runLifeHook
    _runLifeHook(mockEnterHook, mockLeaveHook, mockOnEnter);

    // 验证 enterHook 被调用
    expect(mockEnterHook).toHaveBeenCalledTimes(1);
    expect(mockLeaveHook).toHaveBeenCalledTimes(1);

    // 获取 enterHook 的回调函数
    const enterCallback = mockEnterHook.mock.calls[0][0];

    // 执行 enterCallback
    await enterCallback();

    // 验证 onEnter 被调用
    expect(mockOnEnter).toHaveBeenCalledTimes(1);
  });

  it('应该在离开时正确执行清理函数', async () => {
    const mockEnterHook = vi.fn<() => void>();
    const mockLeaveHook = vi.fn<() => void>();
    const cleanup = vi.fn<() => void>();
    const mockOnEnter = vi.fn<() => void>(() => cleanup);

    // 调用 _runLifeHook
    _runLifeHook(mockEnterHook, mockLeaveHook, mockOnEnter);

    // 获取 enterHook 的回调函数
    const enterCallback = mockEnterHook.mock.calls[0][0];

    // 执行 enterCallback
    await enterCallback();

    // 获取 leaveHook 的回调函数
    const leaveCallback = mockLeaveHook.mock.calls[0][0];

    // 执行 leaveCallback
    leaveCallback();

    // 验证清理函数被执行
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('应该支持异步回调函数', async () => {
    const mockEnterHook = vi.fn<() => void>();
    const mockLeaveHook = vi.fn<() => void>();
    const cleanup = vi.fn<() => void>();
    const mockOnEnter = vi.fn<() => void>(async () => cleanup);

    // 调用 _runLifeHook
    _runLifeHook(mockEnterHook, mockLeaveHook, mockOnEnter);

    // 获取 enterHook 的回调函数
    const enterCallback = mockEnterHook.mock.calls[0][0];

    // 执行 enterCallback
    await enterCallback();

    // 获取 leaveHook 的回调函数
    const leaveCallback = mockLeaveHook.mock.calls[0][0];

    // 执行 leaveCallback
    leaveCallback();

    // 验证清理函数被执行
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('应该正确处理不返回清理函数的情况', async () => {
    const mockEnterHook = vi.fn<() => void>();
    const mockLeaveHook = vi.fn<() => void>();
    const mockOnEnter = vi.fn<() => void>();

    // 调用 _runLifeHook
    _runLifeHook(mockEnterHook, mockLeaveHook, mockOnEnter);

    // 获取 enterHook 的回调函数
    const enterCallback = mockEnterHook.mock.calls[0][0];

    // 执行 enterCallback
    await enterCallback();

    // 获取 leaveHook 的回调函数
    const leaveCallback = mockLeaveHook.mock.calls[0][0];

    // 执行 leaveCallback（不应该报错）
    expect(() => leaveCallback()).not.toThrow();

    // 验证 onEnter 被调用
    expect(mockOnEnter).toHaveBeenCalledTimes(1);
  });
});
