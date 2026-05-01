import { setStyle } from './dom';

/**
 * 加载图片并返回一个包含 HTMLImageElement 的 Promise
 * @param {string} url - 图片的 URL 地址
 * @returns {Promise<HTMLImageElement>} 返回一个包含 HTMLImageElement 的 Promise
 * @example
 * const img = await imageLoad('https://example.com/image.png');
 * @throws {Error} 如果图片加载失败，抛出错误
 */
export async function imageLoad(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    let finished = false;
    const onFinish = (isError?: boolean) => {
      if (finished) return;
      finished = true;
      image.onload = image.onerror = null;
      document.body.removeChild(image);
      isError ? reject(new Error('图片加载失败')) : resolve(image);
    };
    image.onload = () => onFinish();
    image.onerror = () => onFinish(true);
    image.crossOrigin = 'anonymous';
    image.src = url;

    // ios 拍照产生的图片，如果没有插入的 DOM 中获取到的图片尺寸是相反的
    setStyle(image, {
      visibility: 'hidden',
      position: 'absolute',
      top: '-99999%',
      left: '-99999%',
      maxWidth: 'none',
      maxHeight: 'none',
      border: '0',
      width: 'auto',
      height: 'auto',
      margin: '0',
      padding: '0',
      transform: '',
    });
    document.body.appendChild(image);

    if (image.complete && image.width > 0) onFinish();
  });
}

// 图片缩放函数
