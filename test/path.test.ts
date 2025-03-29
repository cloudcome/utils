import path from 'node:path/posix';
import { pathJoin, pathNormalize } from '@/path';
import { describe, expect, it } from 'vitest';

function testNormalize(value: string) {
  expect(pathNormalize(value)).toBe(path.normalize(value));
}

function testJoin(from: string, ...to: string[]) {
  expect(pathJoin.apply(pathJoin, [from, ...to])).toBe(path.join.apply(path, [from, ...to]));
}

describe('pathNormalize', () => {
  it('应正确标准化路径', () => {
    testNormalize('/path///to///file');
    testNormalize('path/to/file');
    testNormalize('/path/to/./file');
    testNormalize('/path/to/../file');
    testNormalize('/path/to/../../file');
    testNormalize('/path/to/../../../file');
    testNormalize('/path/to/../../../../file');
    testNormalize('/path/to/../../file/');
    testNormalize('/path/to/./file/');
    testNormalize('/path/to/./');
    testNormalize('/path/to/../');
    testNormalize('/path/to/../../');
    testNormalize('/path/to/../../../');
    testNormalize('/path/to/../../../../');
    testNormalize('/path/to/./././file');
    testNormalize('/path/to/.././file');
    testNormalize('/path/to/../.././file');
    testNormalize('/path/to/../../.././file');
    testNormalize('/path/to/../../../.././file');
    testNormalize('/path/to/./../file');
    testNormalize('/path/to/./../../file');
    testNormalize('/path/to/./../../../file');
    testNormalize('/path/to/./../../../../file');
    testNormalize('/path/to/././file');
    testNormalize('/path/to/../././file');
    testNormalize('/path/to/../../././file');
    testNormalize('/path/to/../../../././file');
    testNormalize('/path/to/../../../../././file');
  });

  it('应正确处理绝对路径和相对路径', () => {
    testNormalize('/path/to/file');
    testNormalize('path/to/file');
    testNormalize('/./path/to/file');
    testNormalize('./path/to/file');
    testNormalize('../path/to/file');
    testNormalize('/path/to/./file');
    testNormalize('path/to/./file');
    testNormalize('/path/to/../file');
    testNormalize('path/to/../file');
    testNormalize('/path/to/../../file');
    testNormalize('path/to/../../file');
    testNormalize('/path/to/../../../file');
    testNormalize('path/to/../../../file');
    testNormalize('/path/to/../../../../file');
    testNormalize('path/to/../../../../file');
  });
});

describe('pathJoin', () => {
  it('应正确合并路径', () => {
    testJoin('/path', 'to', 'file');
    testJoin('path', 'to', 'file');
    testJoin('/path', '/to', 'file');
    testJoin('path', '/to', 'file');
    testJoin('/path', 'to', '/file');
    testJoin('path', 'to', '/file');
    testJoin('/path', '/to', '/file');
    testJoin('path', '/to', '/file');
    testJoin('/path', 'to', 'file/');
    testJoin('path', 'to', 'file/');
    testJoin('/path', 'to/', 'file');
    testJoin('path', 'to/', 'file');
    testJoin('/path', 'to/', 'file/');
    testJoin('path', 'to/', 'file/');
    testJoin('/path', '/to', 'file/');
    testJoin('path', '/to', 'file/');
    testJoin('/path', '/to/', 'file');
    testJoin('path', '/to/', 'file');
    testJoin('/path', '/to/', 'file/');
    testJoin('path', '/to/', 'file/');
    testJoin('/path', 'to', '/file/');
    testJoin('path', 'to', '/file/');
    testJoin('/path', '/to', '/file/');
    testJoin('path', '/to', '/file/');
  });
});
