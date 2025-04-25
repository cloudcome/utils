import { cookieDel, cookieGet, cookieSet } from '@/cookie';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Cookie Utilities', () => {
  beforeEach(() => {
    // 清空所有 Cookie
    for (const cookie of document.cookie.split(';')) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.slice(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  });

  describe('cookieGet', () => {
    it('should return the value of an existing cookie', () => {
      document.cookie = 'testKey=testValue';
      expect(cookieGet('testKey')).toBe('testValue');
    });

    it('should return an empty string for a non-existing cookie', () => {
      expect(cookieGet('nonExistingKey')).toBe('');
    });
  });

  describe('cookieSet', () => {
    it('should set a cookie with default options', () => {
      cookieSet('defaultKey', 'defaultValue');
      expect(document.cookie).toContain('defaultKey=defaultValue');
    });

    it('should set a cookie with custom options', () => {
      cookieSet('customKey', 'customValue', {
        expires: new Date('2030-01-01'),
        path: '/',
        domain: location.host,
        secure: true,
        sameSite: 'none',
        httpOnly: false,
        maxAge: 3600,
      });
      expect(document.cookie).toEqual('');
    });
  });

  describe('cookieDel', () => {
    it('should delete a cookie by setting its expiration to the past', () => {
      document.cookie = 'deleteKey=deleteValue';
      cookieDel('deleteKey');
      expect(document.cookie).not.toContain('deleteKey=deleteValue');
    });
  });
});
