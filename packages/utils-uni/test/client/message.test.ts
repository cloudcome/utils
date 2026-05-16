import { describe, expect, it, vi } from 'vitest';
import { uniAlert, uniConfirm, uniLoading, uniPrompt, uniToast } from '@/client';
import type { AnyFunction } from '@cloudcome/utils-core/types';

const mockShowModal = vi.fn<AnyFunction>();
const mockShowToast = vi.fn<AnyFunction>();
const mockShowLoading = vi.fn<AnyFunction>();

beforeAll(() => {
  // @ts-expect-error
  global.uni = {
    showModal: mockShowModal,
    showToast: mockShowToast,
    showLoading: mockShowLoading,
  };
});

afterAll(() => {
  // @ts-expect-error
  delete global.uni;
});

beforeEach(() => {
  mockShowModal.mockReset();
  mockShowToast.mockReset();
  mockShowLoading.mockReset();
});

describe('uniConfirm', () => {
  it('应该在用户确认时返回 true', async () => {
    mockShowModal.mockImplementation((opts: any) => {
      opts.success({ confirm: true });
    });

    const result = await uniConfirm('确认操作？');
    expect(result).toBe(true);
    expect(mockShowModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '确认操作？',
        showCancel: true,
      }),
    );
  });

  it('应该在用户取消时返回 false', async () => {
    mockShowModal.mockImplementation((opts: any) => {
      opts.success({ confirm: false });
    });

    const result = await uniConfirm('确认操作？');
    expect(result).toBe(false);
  });

  it('应该使用默认标题和按钮文本', async () => {
    mockShowModal.mockImplementation((opts: any) => {
      opts.success({ confirm: true });
    });

    await uniConfirm('测试');
    expect(mockShowModal).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '请确认',
        confirmText: '确认',
        cancelText: '取消',
      }),
    );
  });

  it('应该支持自定义选项', async () => {
    mockShowModal.mockImplementation((opts: any) => {
      opts.success({ confirm: true });
    });

    await uniConfirm('测试', {
      title: '自定义标题',
      confirmText: '确定',
      cancelText: '返回',
    });

    expect(mockShowModal).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '自定义标题',
        confirmText: '确定',
        cancelText: '返回',
      }),
    );
  });

  it('应该在cancelText超过4个字符时发出警告', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockShowModal.mockImplementation((opts: any) => {
      opts.success({ confirm: true });
    });

    await uniConfirm('测试', { cancelText: '取消操作啊' });

    expect(warnSpy).toHaveBeenCalledWith('微信小程序内不支持 cancelText 长度超过 4 个字符');

    warnSpy.mockRestore();
  });

  it('应该在confirmText超过4个字符时发出警告', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockShowModal.mockImplementation((opts: any) => {
      opts.success({ confirm: true });
    });

    await uniConfirm('测试', { confirmText: '确认操作啊' });

    expect(warnSpy).toHaveBeenCalledWith('微信小程序内不支持 confirmText 长度超过 4 个字符');

    warnSpy.mockRestore();
  });
});

describe('uniPrompt', () => {
  it('应该在用户输入时返回输入内容', async () => {
    mockShowModal.mockImplementation((opts: any) => {
      opts.success({ content: '用户输入' });
    });

    const result = await uniPrompt('请输入名称');
    expect(result).toBe('用户输入');
    expect(mockShowModal).toHaveBeenCalledWith(
      expect.objectContaining({
        placeholderText: '请输入名称',
        editable: true,
        showCancel: true,
      }),
    );
  });

  it('应该在用户未输入时返回空字符串', async () => {
    mockShowModal.mockImplementation((opts: any) => {
      opts.success({ content: null });
    });

    const result = await uniPrompt('请输入名称');
    expect(result).toBe('');
  });

  it('应该使用默认标题和按钮文本', async () => {
    mockShowModal.mockImplementation((opts: any) => {
      opts.success({ content: '' });
    });

    await uniPrompt('测试');
    expect(mockShowModal).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '请输入',
        confirmText: '确认',
        cancelText: '取消',
        editable: true,
      }),
    );
  });

  it('应该支持自定义选项', async () => {
    mockShowModal.mockImplementation((opts: any) => {
      opts.success({ content: '' });
    });

    await uniPrompt('测试', {
      title: '自定义标题',
      confirmText: '提交',
    });

    expect(mockShowModal).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '自定义标题',
        confirmText: '提交',
      }),
    );
  });
});

describe('uniAlert', () => {
  it('应该在用户点击确认后 resolve', async () => {
    mockShowModal.mockImplementation((opts: any) => {
      opts.success();
    });

    await uniAlert('提示信息');
    expect(mockShowModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '提示信息',
        showCancel: false,
      }),
    );
  });

  it('应该使用默认标题和按钮文本', async () => {
    mockShowModal.mockImplementation((opts: any) => {
      opts.success();
    });

    await uniAlert('测试');
    expect(mockShowModal).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '提示',
        confirmText: '好',
        showCancel: false,
      }),
    );
  });

  it('应该支持自定义选项', async () => {
    mockShowModal.mockImplementation((opts: any) => {
      opts.success();
    });

    await uniAlert('测试', {
      title: '自定义标题',
      confirmText: '知道了',
    });

    expect(mockShowModal).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '自定义标题',
        confirmText: '知道了',
      }),
    );
  });

  it('应该在confirmText超过4个字符时发出警告', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockShowModal.mockImplementation((opts: any) => {
      opts.success();
    });

    await uniAlert('测试', { confirmText: '确认操作啊' });

    expect(warnSpy).toHaveBeenCalledWith('微信小程序内不支持 confirmText 长度超过 4 个字符');

    warnSpy.mockRestore();
  });
});

describe('uniToast', () => {
  it('应该在显示toast后 resolve', async () => {
    mockShowToast.mockImplementation(() => {});

    await uniToast('提示信息');
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '提示信息',
        icon: 'none',
        duration: 2900,
      }),
    );
  });

  it('应该支持传入字符串图标参数', async () => {
    mockShowToast.mockImplementation(() => {});

    await uniToast('成功', 'success');
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '成功',
        icon: 'success',
      }),
    );
  });

  it('应该支持传入选项对象参数', async () => {
    mockShowToast.mockImplementation(() => {});

    await uniToast('成功', { icon: 'success', duration: 1500 });
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '成功',
        icon: 'success',
      }),
    );
  });

  it('应该在没有指定图标时默认使用 none', async () => {
    mockShowToast.mockImplementation(() => {});

    await uniToast('提示');
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'none',
      }),
    );
  });
});

describe('uniLoading', () => {
  it('应该调用 uni.showLoading 并传入 mask: true', () => {
    uniLoading('加载中...');
    expect(mockShowLoading).toHaveBeenCalledWith({
      title: '加载中...',
      mask: true,
    });
  });

  it('应该支持不传标题', () => {
    uniLoading();
    expect(mockShowLoading).toHaveBeenCalledWith({
      title: undefined,
      mask: true,
    });
  });
});
