import { beforeEach, describe, expect, it } from 'vitest';
import { cookieDel, cookieGet, cookieSet } from '@/cookie';

describe('Cookie 工具函数', () => {
  beforeEach(() => {
    // 清空所有 Cookie
    for (const cookie of document.cookie.split(';')) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.slice(0, eqPos) : cookie;
      // biome-ignore lint/suspicious/noDocumentCookie: 暂时方案
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  });

  describe('cookieGet', () => {
    it('应返回已存在 cookie 的值', () => {
      // biome-ignore lint/suspicious/noDocumentCookie: 暂时方案
      document.cookie = 'testKey=testValue';
      expect(cookieGet('testKey')).toBe('testValue');
    });

    it('对于不存在的 cookie 应返回空字符串', () => {
      expect(cookieGet('nonExistingKey')).toBe('');
    });
  });

  describe('cookieSet', () => {
    it('应使用默认选项设置 cookie', () => {
      cookieSet('defaultKey', 'defaultValue');
      expect(document.cookie).toContain('defaultKey=defaultValue');
    });

    it('应使用自定义选项设置 cookie', () => {
      cookieSet('customKey', 'customValue', {
        expires: new Date('2030-01-01'),
        path: '/',
        domain: location.host,
        secure: true,
        sameSite: 'none',
        maxAge: 3600,
      });
      expect(document.cookie).toEqual('');
    });
  });

  describe('cookieDel', () => {
    it('应通过设置过期时间为过去来删除 cookie', () => {
      // biome-ignore lint/suspicious/noDocumentCookie: 暂时方案
      document.cookie = 'deleteKey=deleteValue';
      cookieDel('deleteKey');
      expect(document.cookie).not.toContain('deleteKey=deleteValue');
    });
  });
});
