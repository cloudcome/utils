import path from 'node:path/posix';
import { describe, expect, it } from 'vitest';
import {
  isAbsolutePath,
  isRelativePath,
  pathDirname,
  pathJoin,
  pathNormalize,
  pathRelativize,
  pathResolve,
} from '@/path';

function testNormalize(value: string) {
  expect(pathNormalize(value)).toBe(path.normalize(value));
}

function testJoin(from: string, ...to: string[]) {
  expect(pathJoin.apply(pathJoin, [from, ...to])).toBe(
    path.join.apply(path, [from, ...to]),
  );
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

describe('isAbsolutePath', () => {
  it('应正确判断绝对路径', () => {
    expect(isAbsolutePath('/path/to/file')).toBe(true);
    expect(isAbsolutePath('/')).toBe(true);
    expect(isAbsolutePath('/path/../to/file')).toBe(true);
    expect(isAbsolutePath('/path/./to/file')).toBe(true);
  });

  it('应正确判断非绝对路径', () => {
    expect(isAbsolutePath('path/to/file')).toBe(false);
    expect(isAbsolutePath('./path/to/file')).toBe(false);
    expect(isAbsolutePath('../path/to/file')).toBe(false);
    expect(isAbsolutePath('')).toBe(false);
  });
});

describe('isRelativePath', () => {
  it('应正确判断相对路径', () => {
    expect(isRelativePath('path/to/file')).toBe(true);
    expect(isRelativePath('./path/to/file')).toBe(true);
    expect(isRelativePath('../path/to/file')).toBe(true);
    expect(isRelativePath('')).toBe(true);
  });

  it('应正确判断非相对路径', () => {
    expect(isRelativePath('/path/to/file')).toBe(false);
    expect(isRelativePath('/')).toBe(false);
    expect(isRelativePath('/path/../to/file')).toBe(false);
    expect(isRelativePath('/path/./to/file')).toBe(false);
  });
});

describe('pathResolve', () => {
  it('应正确解析路径', () => {
    expect(pathResolve('/path', 'to', 'file')).toBe('/path/to/file');
    expect(pathResolve('/path', '/to', 'file')).toBe('/to/file');
    expect(pathResolve('/path', 'to', '/file')).toBe('/file');
    expect(pathResolve('path', 'to', 'file')).toBe('path/to/file');
    expect(pathResolve('path', '/to', 'file')).toBe('/to/file');
    expect(pathResolve('path', 'to', '/file')).toBe('/file');
    expect(pathResolve('/path', 'to/../file')).toBe('/path/file');
    expect(pathResolve('/path', 'to/./file')).toBe('/path/to/file');
    expect(pathResolve('/path', 'to/../../file')).toBe('/file');
  });
});

describe('pathRelativize', () => {
  it('应正确相对化路径', () => {
    // 绝对路径应保持不变
    expect(pathRelativize('/path/to/file')).toBe('/path/to/file');
    expect(pathRelativize('/')).toBe('/');

    // 已带'./'前缀的相对路径应保持不变
    expect(pathRelativize('./path/to/file')).toBe('./path/to/file');
    expect(pathRelativize('./')).toBe('./');

    // 不带'./'前缀的相对路径应添加'./'前缀
    expect(pathRelativize('path/to/file')).toBe('./path/to/file');
    expect(pathRelativize('file')).toBe('./file');

    // 带'../'前缀的相对路径应保持不变
    expect(pathRelativize('../path/to/file')).toBe('../path/to/file');
  });
});

describe('pathDirname', () => {
  it('应正确获取路径的目录部分', () => {
    expect(pathDirname('/path/to/file.txt')).toBe('/path/to');
    expect(pathDirname('/path/to/dir/')).toBe('/path/to');
    expect(pathDirname('path/to/file.txt')).toBe('path/to');
    expect(pathDirname('file.txt')).toBe('.');
    expect(pathDirname('/')).toBe('/');
    expect(pathDirname('/path')).toBe('/');
    expect(pathDirname('../path/to/file')).toBe('../path/to');
    expect(pathDirname('./file')).toBe('.');
  });
});
