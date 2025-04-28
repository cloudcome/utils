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
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片加载失败'));
    image.crossOrigin = 'anonymous';
    image.src = url;
    if (image.complete && image.width > 0) resolve(image);
  });
}

// 图片缩放函数
