export async function imageLoad(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
    if (img.complete) resolve(img);
  });
}

// 图片缩放函数
