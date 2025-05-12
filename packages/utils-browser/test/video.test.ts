import { describe, expect, it, vi } from 'vitest';
import { videoLoad } from '../src/video';

describe('视频工具函数', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('应该能够成功加载视频', async () => {
    const mockVideo = document.createElement('video');
    vi.spyOn(document, 'createElement').mockReturnValue(mockVideo);

    const url = 'https://example.com/video.mp4';
    const promise = videoLoad(url);

    mockVideo.onloadedmetadata?.({} as Event);
    const result = await promise;

    expect(result).toBe(mockVideo);
    expect(mockVideo.src).toBe(url);
    expect(mockVideo.crossOrigin).toBe('anonymous');
    expect(mockVideo.currentTime).toBe(1);
  });

  it('视频加载失败时应抛出错误', async () => {
    const mockVideo = document.createElement('video');
    vi.spyOn(document, 'createElement').mockReturnValue(mockVideo);

    const url = 'https://example.com/invalid.mp4';
    const promise = videoLoad(url);

    mockVideo.onerror?.({} as Event);

    await expect(promise).rejects.toThrow('视频加载失败');
  });
});
