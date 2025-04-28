import { objectDefaults } from '@cloudcome/utils-core/object';
import { imageLoad } from './image';

export function canvasToBase64(canvas: HTMLCanvasElement, type?: string, quality?: number) {
  return canvas.toDataURL(type, quality);
}

export async function canvasToBlob(canvas: HTMLCanvasElement, type?: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      type,
      quality,
    );
  });
}

export type CanvasDrawImageOptions = {
  srcLeft?: number;
  srcTop?: number;
  srcWidth?: number;
  srcHeight?: number;

  destLeft?: number;
  destTop?: number;
  destWidth?: number;
  destHeight?: number;
};

export async function canvasDrawImage(canvas: HTMLCanvasElement, url: string, options?: CanvasDrawImageOptions) {
  const img = await imageLoad(url);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas context is null');

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
  const { srcLeft, srcTop, srcWidth, srcHeight, destLeft, destTop, destWidth, destHeight } = objectDefaults(
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
