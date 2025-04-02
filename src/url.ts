/**
 * 内部 URL，用作 URL 解析的基础。
 */
const INTERNAL_URL = 'https://--internal--';
/**
 * 内部 URL 的长度。
 */
const INTERNAL_URL_LENGTH = INTERNAL_URL.length;

/**
 * 表示解析后的 URL 组件。
 */
export interface URLComponents {
  /**
   * 协议部分，例如 "https:"。
   */
  protocol: string;
  /**
   * 主机部分，包括主机名和端口。
   */
  host: string;
  /**
   * 主机名部分。
   */
  hostname: string;
  /**
   * 端口部分。
   */
  port: string;
  /**
   * 路径部分。
   */
  pathname: string;
  /**
   * 查询字符串部分。
   */
  search: string;
  /**
   * 哈希部分。
   */
  hash: string;
  /**
   * 用户名部分。
   */
  username: string;
  /**
   * 密码部分。
   */
  password: string;
  /**
   * 源部分，包括协议、主机名和端口。
   */
  origin: string;
  /**
   * 完整的 URL。
   */
  href: string;
}

/**
 * 解析 URL 字符串为组件对象。
 * @param url - 需要解析的 URL 字符串。
 * @returns 包含解析后 URL 组件的对象。
 */
export function urlParse(url: string) {
  const p = new URL(url, INTERNAL_URL);
  const isInternal = p.origin === INTERNAL_URL;

  return {
    protocol: isInternal ? '' : p.protocol,
    hostname: isInternal ? '' : p.hostname,
    host: isInternal ? '' : p.host,
    port: p.port,
    pathname: p.pathname,
    search: p.search,
    hash: p.hash,
    username: p.username,
    password: p.password,
    origin: isInternal ? '' : p.origin,
    href: p.href.slice(isInternal ? INTERNAL_URL_LENGTH : 0),
  } as URLComponents;
}

/**
 * 将 URLInfo 对象转换回 URL 字符串。
 * @param url - 需要转换的 URLInfo 对象。
 * @returns 转换后的 URL 字符串。
 */
export function urlStringify(url: URLComponents) {
  const { protocol, hostname, port, pathname, search, hash, username, password } = url;
  return [
    protocol,
    '//',
    username && password ? `${username}:${password}@` : '',
    hostname,
    port ? `:${port}` : '',
    pathname,
    search,
    hash,
  ]
    .filter(Boolean)
    .join('');
}
