import { describe, expect, it, vi } from 'vitest';
import { uniSubscribeNotice, useAppUpdate } from '@/client';
import type { AnyFunction } from '@cloudcome/utils-core/types';

const mockRequestSubscribeMessage = vi.fn<AnyFunction>();
const mockGetUpdateManager = vi.fn<AnyFunction>();
const mockShowModal = vi.fn<AnyFunction>();

beforeAll(() => {
  vi.useFakeTimers();
  // @ts-expect-error
  global.uni = {
    requestSubscribeMessage: mockRequestSubscribeMessage,
    getUpdateManager: mockGetUpdateManager,
    showModal: mockShowModal,
  };
});

afterAll(() => {
  vi.useRealTimers();
  // @ts-expect-error
  delete global.uni;
});

beforeEach(() => {
  mockRequestSubscribeMessage.mockReset();
  mockGetUpdateManager.mockReset();
  mockShowModal.mockReset();
});

describe('uniSubscribeNotice', () => {
  it('应该在用户同意订阅时返回 true', async () => {
    mockRequestSubscribeMessage.mockImplementation((opts: any) => {
      opts.success({ templateId1: 'accept' });
    });

    const result = await uniSubscribeNotice('templateId1');
    expect(result).toBe(true);
    expect(mockRequestSubscribeMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        tmplIds: ['templateId1'],
      }),
    );
  });

  it('应该在用户拒绝订阅时返回 false', async () => {
    mockRequestSubscribeMessage.mockImplementation((opts: any) => {
      opts.success({ templateId1: 'reject' });
    });

    const result = await uniSubscribeNotice('templateId1');
    expect(result).toBe(false);
  });

  it('应该在模板被封禁时返回 false', async () => {
    mockRequestSubscribeMessage.mockImplementation((opts: any) => {
      opts.success({ templateId1: 'ban' });
    });

    const result = await uniSubscribeNotice('templateId1');
    expect(result).toBe(false);
  });

  it('应该在模板被过滤时返回 false', async () => {
    mockRequestSubscribeMessage.mockImplementation((opts: any) => {
      opts.success({ templateId1: 'filter' });
    });

    const result = await uniSubscribeNotice('templateId1');
    expect(result).toBe(false);
  });

  it('应该支持传入模板ID数组', async () => {
    mockRequestSubscribeMessage.mockImplementation((opts: any) => {
      opts.success({ templateId2: 'accept' });
    });

    const result = await uniSubscribeNotice(['templateId1', 'templateId2']);
    expect(result).toBe(true);
    expect(mockRequestSubscribeMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        tmplIds: ['templateId1', 'templateId2'],
      }),
    );
  });

  it('应该在多个模板中有一个同意时返回 true', async () => {
    mockRequestSubscribeMessage.mockImplementation((opts: any) => {
      opts.success({
        templateId1: 'reject',
        templateId2: 'accept',
        templateId3: 'ban',
      });
    });

    const result = await uniSubscribeNotice(['templateId1', 'templateId2', 'templateId3']);
    expect(result).toBe(true);
  });

  it('应该在所有模板都拒绝时返回 false', async () => {
    mockRequestSubscribeMessage.mockImplementation((opts: any) => {
      opts.success({
        templateId1: 'reject',
        templateId2: 'reject',
      });
    });

    const result = await uniSubscribeNotice(['templateId1', 'templateId2']);
    expect(result).toBe(false);
  });

  it('应该在请求失败时返回 false', async () => {
    mockRequestSubscribeMessage.mockImplementation((opts: any) => {
      opts.fail();
    });

    const result = await uniSubscribeNotice('templateId1');
    expect(result).toBe(false);
  });

  it('应该在 requestSubscribeMessage 不可用时返回 false', async () => {
    // @ts-expect-error
    global.uni.requestSubscribeMessage = undefined;

    const result = await uniSubscribeNotice('templateId1');
    expect(result).toBe(false);

    // @ts-expect-error
    global.uni.requestSubscribeMessage = mockRequestSubscribeMessage;
  });
});

describe('useAppUpdate', () => {
  it('应该返回响应式的 hasUpdate 和 updateReady', () => {
    const mockOnCheckForUpdate = vi.fn<AnyFunction>();
    const mockOnUpdateReady = vi.fn<AnyFunction>();
    const mockOnUpdateFailed = vi.fn<AnyFunction>();

    mockGetUpdateManager.mockReturnValue({
      onCheckForUpdate: mockOnCheckForUpdate,
      onUpdateReady: mockOnUpdateReady,
      onUpdateFailed: mockOnUpdateFailed,
      applyUpdate: vi.fn<AnyFunction>(),
    });

    const { hasUpdate, updateReady } = useAppUpdate();

    expect(hasUpdate.value).toBe(false);
    expect(updateReady.value).toBe(false);
    expect(mockGetUpdateManager).toHaveBeenCalled();
    expect(mockOnCheckForUpdate).toHaveBeenCalled();
    expect(mockOnUpdateReady).toHaveBeenCalled();
    expect(mockOnUpdateFailed).toHaveBeenCalled();
  });

  it('应该在检测到更新时设置 hasUpdate 为 true', () => {
    const mockOnCheckForUpdate = vi.fn<AnyFunction>();
    const mockOnUpdateReady = vi.fn<AnyFunction>();
    const mockOnUpdateFailed = vi.fn<AnyFunction>();

    mockGetUpdateManager.mockReturnValue({
      onCheckForUpdate: mockOnCheckForUpdate,
      onUpdateReady: mockOnUpdateReady,
      onUpdateFailed: mockOnUpdateFailed,
      applyUpdate: vi.fn<AnyFunction>(),
    });

    const { hasUpdate } = useAppUpdate();

    const onCheckCallback = mockOnCheckForUpdate.mock.calls[0][0];
    onCheckCallback({ hasUpdate: true });

    expect(hasUpdate.value).toBe(true);
  });

  it('应该在未检测到更新时保持 hasUpdate 为 false', () => {
    const mockOnCheckForUpdate = vi.fn<AnyFunction>();
    const mockOnUpdateReady = vi.fn<AnyFunction>();
    const mockOnUpdateFailed = vi.fn<AnyFunction>();

    mockGetUpdateManager.mockReturnValue({
      onCheckForUpdate: mockOnCheckForUpdate,
      onUpdateReady: mockOnUpdateReady,
      onUpdateFailed: mockOnUpdateFailed,
      applyUpdate: vi.fn<AnyFunction>(),
    });

    const { hasUpdate } = useAppUpdate();

    const onCheckCallback = mockOnCheckForUpdate.mock.calls[0][0];
    onCheckCallback({ hasUpdate: false });

    expect(hasUpdate.value).toBe(false);
  });

  it('应该在更新准备就绪时设置 updateReady 为 true', async () => {
    const mockApplyUpdate = vi.fn<AnyFunction>();
    const mockOnCheckForUpdate = vi.fn<AnyFunction>();
    const mockOnUpdateReady = vi.fn<AnyFunction>();
    const mockOnUpdateFailed = vi.fn<AnyFunction>();

    mockGetUpdateManager.mockReturnValue({
      onCheckForUpdate: mockOnCheckForUpdate,
      onUpdateReady: mockOnUpdateReady,
      onUpdateFailed: mockOnUpdateFailed,
      applyUpdate: mockApplyUpdate,
    });

    mockShowModal.mockImplementation((opts: any) => {
      opts.success({ confirm: true });
    });

    const { updateReady } = useAppUpdate();

    const onUpdateReadyCallback = mockOnUpdateReady.mock.calls[0][0];
    onUpdateReadyCallback();

    expect(updateReady.value).toBe(true);

    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();

    expect(mockShowModal).toHaveBeenCalled();
  });

  it('应该在用户确认更新时调用 applyUpdate', async () => {
    const mockApplyUpdate = vi.fn<AnyFunction>();
    const mockOnCheckForUpdate = vi.fn<AnyFunction>();
    const mockOnUpdateReady = vi.fn<AnyFunction>();
    const mockOnUpdateFailed = vi.fn<AnyFunction>();

    mockGetUpdateManager.mockReturnValue({
      onCheckForUpdate: mockOnCheckForUpdate,
      onUpdateReady: mockOnUpdateReady,
      onUpdateFailed: mockOnUpdateFailed,
      applyUpdate: mockApplyUpdate,
    });

    mockShowModal.mockImplementation((opts: any) => {
      opts.success({ confirm: true });
    });

    useAppUpdate();

    const onUpdateReadyCallback = mockOnUpdateReady.mock.calls[0][0];
    onUpdateReadyCallback();

    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();

    expect(mockApplyUpdate).toHaveBeenCalled();
  });

  it('应该在用户拒绝更新时不调用 applyUpdate', async () => {
    const mockApplyUpdate = vi.fn<AnyFunction>();
    const mockOnCheckForUpdate = vi.fn<AnyFunction>();
    const mockOnUpdateReady = vi.fn<AnyFunction>();
    const mockOnUpdateFailed = vi.fn<AnyFunction>();

    mockGetUpdateManager.mockReturnValue({
      onCheckForUpdate: mockOnCheckForUpdate,
      onUpdateReady: mockOnUpdateReady,
      onUpdateFailed: mockOnUpdateFailed,
      applyUpdate: mockApplyUpdate,
    });

    mockShowModal.mockImplementation((opts: any) => {
      opts.success({ confirm: false });
    });

    useAppUpdate();

    const onUpdateReadyCallback = mockOnUpdateReady.mock.calls[0][0];
    onUpdateReadyCallback();

    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();

    expect(mockApplyUpdate).not.toHaveBeenCalled();
  });

  it('应该在 getUpdateManager 不可用时安全返回', () => {
    mockGetUpdateManager.mockReturnValue(undefined);

    const { hasUpdate, updateReady } = useAppUpdate();

    expect(hasUpdate.value).toBe(false);
    expect(updateReady.value).toBe(false);
  });
});
