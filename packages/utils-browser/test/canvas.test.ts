import { canvasDrawImage, canvasToBase64, canvasToBlob } from '@/canvas';
import { imageLoad } from '@/image';
import { loadImage } from 'canvas';
import { describe, expect, it, vi } from 'vitest';

describe('canvas utils', () => {
  describe('canvasToBase64', () => {
    it('should return base64 string with default png format', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      const result = canvasToBase64(canvas);
      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it('should return base64 string with specified format and quality', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      const result = canvasToBase64(canvas, 'image/jpeg', 0.8);
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
    });
  });

  describe('canvasToBlob', () => {
    it('should return blob with default png format', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      const blob = await canvasToBlob(canvas);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('should return blob with specified format and quality', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/jpeg');
    });

    it('should reject when canvas toBlob fails', async () => {
      const canvas = document.createElement('canvas');
      vi.spyOn(canvas, 'toBlob').mockImplementationOnce((callback) => callback(null));

      await expect(canvasToBlob(canvas)).rejects.toThrow('canvas 导出二进制对象失败');
    });
  });

  describe('canvasDrawImage', () => {
    it('should draw image with default options', async () => {
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
    });

    it('should draw image with custom options', async () => {
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
    });

    it('should throw error when canvas context is null', async () => {
      const canvas = document.createElement('canvas');
      vi.spyOn(canvas, 'getContext').mockReturnValueOnce(null);

      await expect(canvasDrawImage(canvas, 'https://example.com/image.png')).rejects.toThrow('canvas context is null');
    });
  });
});
