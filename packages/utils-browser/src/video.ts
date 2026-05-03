/**
 * 加载视频并返回一个包含 HTMLVideoElement 的 Promise
 * @param {string} url - 视频的 URL 地址
 * @returns {Promise<HTMLVideoElement>} 返回一个包含 HTMLVideoElement 的 Promise
 * @example
 * const video = await videoLoad('https://example.com/video.mp4');
 * @throws {Error} 如果视频加载失败，抛出错误
 */
export async function videoLoad(url: string) {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    const video = document.createElement('video');
    const onFinish = (isError?: boolean) => {
      video.onload = video.onerror = null;
      isError ? reject(new Error('视频加载失败')) : resolve(video);
    };

    video.src = url;
    video.crossOrigin = 'anonymous';
    video.currentTime = 1;
    video.onloadedmetadata = () => onFinish();
    video.onerror = () => onFinish(true);
  });
}
