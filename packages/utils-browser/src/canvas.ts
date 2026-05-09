import { objectDefaults } from '@cloudcome/utils-core/object';
import { imageLoad } from './image';

/**
 * 将 Canvas 转换为 Base64 编码的字符串
 * @param {HTMLCanvasElement} canvas - 需要转换的 Canvas 元素
 * @param {string} [type] - 图片格式，默认为 'image/png'
 * @param {number} [quality] - 图片质量，范围 0 到 1，仅适用于 'image/jpeg' 或 'image/webp'
 * @returns {string} Base64 编码的图片数据
 * @example
 * const base64 = canvasToBase64(canvas, 'image/jpeg', 0.8);
 */
export function canvasToBase64(
  canvas: HTMLCanvasElement,
  type?: string,
  quality?: number,
) {
  return canvas.toDataURL(type, quality);
}

/**
 * 将 Canvas 转换为 Blob 对象
 * @param {HTMLCanvasElement} canvas - 需要转换的 Canvas 元素
 * @param {string} [type] - 图片格式，默认为 'image/png'
 * @param {number} [quality] - 图片质量，范围 0 到 1，仅适用于 'image/jpeg' 或 'image/webp'
 * @returns {Promise<Blob>} 返回一个包含 Blob 对象的 Promise
 * @example
 * const blob = await canvasToBlob(canvas, 'image/jpeg', 0.8);
 */
export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type?: string,
  quality?: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('canvas 导出二进制对象失败'));
        }
      },
      type,
      quality,
    );
  });
}

/**
 * Canvas 绘制图片的配置选项
 */
export type CanvasDrawImageOptions = {
  /**
   * 源图片的左上角 x 坐标
   * @type {number}
   * @default 0
   */
  srcLeft?: number;
  /**
   * 源图片的左上角 y 坐标
   * @type {number}
   * @default 0
   */
  srcTop?: number;
  /**
   * 源图片的宽度
   * @type {number}
   * @default 图片的原始宽度
   */
  srcWidth?: number;
  /**
   * 源图片的高度
   * @type {number}
   * @default 图片的原始高度
   */
  srcHeight?: number;

  /**
   * 目标 Canvas 的左上角 x 坐标
   * @type {number}
   * @default 0
   */
  destLeft?: number;
  /**
   * 目标 Canvas 的左上角 y 坐标
   * @type {number}
   * @default 0
   */
  destTop?: number;
  /**
   * 目标 Canvas 的宽度
   * @type {number}
   * @default Canvas 的宽度
   */
  destWidth?: number;
  /**
   * 目标 Canvas 的高度
   * @type {number}
   * @default Canvas 的高度
   */
  destHeight?: number;
};

/**
 * 在 Canvas 上绘制图片
 * @param {HTMLCanvasElement} canvas - 目标 Canvas 元素
 * @param {string} url - 图片的 URL
 * @param {CanvasDrawImageOptions} [options] - 绘制图片的配置选项
 * @returns {Promise<void>} 返回一个 Promise，表示绘制完成
 * @example
 * await canvasDrawImage(canvas, 'https://example.com/image.png', {
 *   srcLeft: 10,
 *   srcTop: 10,
 *   srcWidth: 100,
 *   srcHeight: 100,
 *   destLeft: 0,
 *   destTop: 0,
 *   destWidth: 200,
 *   destHeight: 200
 * });
 */
export async function canvasDrawImage(
  canvas: HTMLCanvasElement,
  url: string,
  options?: CanvasDrawImageOptions,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas context is null');

  const img = await imageLoad(url);
  const defaults: CanvasDrawImageOptions = {
    srcLeft: 0,
    srcTop: 0,
    srcWidth: img.width,
    srcHeight: img.height,
    destLeft: 0,
    destTop: 0,
    destWidth: canvas.width,
    destHeight: canvas.height,
  };
  const {
    srcLeft,
    srcTop,
    srcWidth,
    srcHeight,
    destLeft,
    destTop,
    destWidth,
    destHeight,
  } = objectDefaults(
    options || {},
    defaults,
  ) as Required<CanvasDrawImageOptions>;
  ctx.drawImage(
    img,
    // source
    srcLeft,
    srcTop,
    srcWidth,
    srcHeight,
    // dest
    destLeft,
    destTop,
    destWidth,
    destHeight,
  );
}
