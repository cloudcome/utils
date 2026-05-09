import { describe, expect, test } from 'vitest';
import { base64toBlob } from '@/base64';

describe('base64toBlob', () => {
  // 通用验证方法
  const validateBlob = (base64: string, expectedType: string) => {
    const blob = base64toBlob(base64);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe(expectedType);
    return blob;
  };

  test('PNG 转换验证', () => {
    const pngBase64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const blob = validateBlob(pngBase64, 'image/png');
    expect(blob.size).toBe(70); // 实际解码后的字节长度
  });

  test('JPEG 转换验证', () => {
    const jpegBase64 =
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJVAAP/aAAwDAQACEQMRAD8AlUAA//Z';
    const blob = validateBlob(jpegBase64, 'image/jpeg');
    expect(blob.size).toBe(302);
  });

  test('无数据前缀处理', () => {
    const rawBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    expect(() => base64toBlob(rawBase64)).toThrowError();
  });
});
