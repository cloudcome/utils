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
