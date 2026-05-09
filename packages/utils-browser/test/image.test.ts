import { describe, expect, it, vi } from 'vitest';
import { imageLoad } from '../src/image';

describe('图片工具函数', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('应该能够成功加载图片', async () => {
    const mockImage = document.createElement('img');
    vi.spyOn(window, 'Image').mockImplementation(() => mockImage);
    vi.spyOn(document.body, 'appendChild');
    vi.spyOn(document.body, 'removeChild');

    const url = 'https://example.com/image.png';
    const promise = imageLoad(url);

    mockImage.onload?.({} as Event);
    const result = await promise;

    expect(result).toBe(mockImage);
    expect(mockImage.src).toBe(url);
    expect(mockImage.crossOrigin).toBe('anonymous');
    expect(document.body.appendChild).toHaveBeenCalledWith(mockImage);
    expect(document.body.removeChild).toHaveBeenCalledWith(mockImage);
  });

  it('图片加载失败时应抛出错误', async () => {
    const mockImage = document.createElement('img');
    vi.spyOn(window, 'Image').mockImplementation(() => mockImage);

    const url = 'https://example.com/invalid.png';
    const promise = imageLoad(url);

    mockImage.onerror?.({} as Event);

    await expect(promise).rejects.toThrow('图片加载失败');
  });

  it('如果图片已经加载完成应立即返回', async () => {
    const mockImage = document.createElement('img');
    vi.spyOn(window, 'Image').mockImplementation(() => mockImage);
    Object.defineProperty(mockImage, 'complete', {
      value: true,
      configurable: true,
    });
    Object.defineProperty(mockImage, 'width', {
      value: 100,
      configurable: true,
    });

    const url = 'https://example.com/image.png';
    const result = await imageLoad(url);

    expect(result).toBe(mockImage);
  });

  it('应该为图片元素设置正确的样式', async () => {
    const mockImage = document.createElement('img');
    vi.spyOn(window, 'Image').mockImplementation(() => mockImage);

    const url = 'https://example.com/image.png';
    const promise = imageLoad(url);

    mockImage.onload?.({} as Event);
    await promise;

    expect(mockImage.style.visibility).toBe('hidden');
    expect(mockImage.style.position).toBe('absolute');
    expect(mockImage.style.top).toBe('-99999%');
    expect(mockImage.style.left).toBe('-99999%');
    expect(mockImage.style.maxWidth).toBe('');
    expect(mockImage.style.maxHeight).toBe('');
    expect(mockImage.style.border).toBe('0px');
    expect(mockImage.style.width).toBe('auto');
    expect(mockImage.style.height).toBe('auto');
    expect(mockImage.style.margin).toBe('0px');
    expect(mockImage.style.padding).toBe('0px');
    expect(mockImage.style.transform).toBe('');
  });
});
