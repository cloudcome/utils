import type { DateValue } from '@cloudcome/utils-core/date';
import { dateParse } from '@cloudcome/utils-core/date';

/**
 * 获取指定名称的 Cookie 值。
 * @param {string} name - Cookie 的名称。
 * @returns {string} - 返回对应的 Cookie 值，如果不存在则返回空字符串。
 */
export function cookieGet(name: string) {
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();

    if (cookie.startsWith(`${name}=`)) {
      try {
        return decodeURIComponent(cookie.slice(name.length + 1));
      } catch {
        return cookie.slice(name.length + 1);
      }
    }
  }

  return '';
}

/**
 * 设置 Cookie。
 * @param {string} name - Cookie 的名称。
 * @param {string} value - Cookie 的值。
 * @param {CookieOptions} [options] - 可选的 Cookie 配置项。
 */
export type CookieOptions = {
  /**
   * Cookie 的过期时间，可以是日期字符串、时间戳或 `Date` 对象。
   */
  expires?: DateValue;

  /**
   * Cookie 的路径，默认为当前路径。
   */
  path?: string;

  /**
   * Cookie 的域名，默认为当前域名。
   */
  domain?: string;

  /**
   * 是否启用安全传输（HTTPS）。
   */
  secure?: boolean;

  /**
   * SameSite 属性，可选值为 `'strict'`、`'lax'` 或 `'none'`。
   */
  sameSite?: 'strict' | 'lax' | 'none';

  /**
   * Cookie 的最大存活时间（秒）。
   */
  maxAge?: number;
};

/**
 * 设置 Cookie。
 * @param {string} name - Cookie 的名称。
 * @param {string} value - Cookie 的值。
 * @param {CookieOptions} [options] - 可选的 Cookie 配置项。
 */
export function cookieSet(name: string, value: string, options?: CookieOptions) {
  const { expires, maxAge, path, domain, sameSite, secure } = options || {};
  let cookie = `${name}=${encodeURIComponent(value)}`;

  const expiresAt = expires ? dateParse(expires) : maxAge ? dateParse(Date.now() + maxAge * 1000) : null;
  const metas: [string, string][] = [];

  if (expiresAt) {
    metas.push(['expires', expiresAt.toISOString()]);
  }

  if (path) {
    metas.push(['path', path]);
  }

  if (domain) {
    metas.push(['domain', domain]);
  }

  if (sameSite) {
    metas.push(['sameSite', sameSite]);
  }

  if (secure) {
    metas.push(['secure', 'true']);
  }

  for (const [key, value] of metas) {
    cookie += `; ${key}=${value}`;
  }

  document.cookie = cookie;
}

/**
 * 删除指定名称的 Cookie。
 * @param {string} name - 要删除的 Cookie 名称。
 */
export function cookieDel(name: string) {
  cookieSet(name, '', {
    expires: 0,
  });
}
