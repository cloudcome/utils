import { canvasDrawImage, canvasToBase64, canvasToBlob } from '@/canvas';
import { imageLoad } from '@/image';
import { loadImage } from 'canvas';
import { describe, expect, it, vi } from 'vitest';

describe('canvasToBase64', () => {
  it('应返回默认 png 格式的 base64 字符串', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    const result = canvasToBase64(canvas);
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it('应返回指定格式和质量的 base64 字符串', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    const result = canvasToBase64(canvas, 'image/jpeg', 0.8);
    expect(result).toMatch(/^data:image\/jpeg;base64,/);
  });
});

describe('canvasToBlob', () => {
  it('应返回默认 png 格式的 Blob 对象', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    const blob = await canvasToBlob(canvas);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
  });

  it('应返回指定格式和质量的 Blob 对象', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/jpeg');
  });

  it('当 canvas toBlob 失败时应拒绝', async () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'toBlob').mockImplementationOnce((callback) => callback(null));

    await expect(canvasToBlob(canvas)).rejects.toThrow('canvas 导出二进制对象失败');
  });
});

describe('canvasDrawImage', () => {
  it(
    '应使用默认选项绘制图像',
    async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context is null');

      const spy = vi.spyOn(ctx, 'drawImage').mockImplementation(() => true);
      const src = 'https://www.baidu.com/img/PCfb_5bf082d29588c07f842ccde3f97243ea.png';
      const img = await imageLoad(src);

      await canvasDrawImage(canvas, img.src);
      expect(spy).toHaveBeenCalledWith(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
    },
    { timeout: 0 },
  );

  it(
    '应使用自定义选项绘制图像',
    async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context is null');

      const spy = vi.spyOn(ctx, 'drawImage').mockImplementation(() => true);
      const src = 'https://www.baidu.com/img/PCfb_5bf082d29588c07f842ccde3f97243ea.png';
      const img = await imageLoad(src);

      const options = {
        srcLeft: 10,
        srcTop: 10,
        srcWidth: 50,
        srcHeight: 50,
        destLeft: 20,
        destTop: 20,
        destWidth: 100,
        destHeight: 100,
      };
      await canvasDrawImage(canvas, img.src, options);
      expect(spy).toHaveBeenCalledWith(
        img,
        options.srcLeft,
        options.srcTop,
        options.srcWidth,
        options.srcHeight,
        options.destLeft,
        options.destTop,
        options.destWidth,
        options.destHeight,
      );
    },
    { timeout: 0 },
  );

  it(
    '当 canvas context 为 null 时应抛出错误',
    async () => {
      const canvas = document.createElement('canvas');
      vi.spyOn(canvas, 'getContext').mockReturnValueOnce(null);

      await expect(canvasDrawImage(canvas, 'https://example.com/image.png')).rejects.toThrow('canvas context is null');
    },
    { timeout: 0 },
  );
});
