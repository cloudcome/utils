/**
 * 表示解析后的 URL 组件。
 */
export interface URLObject {
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
}

/**
 * 解析 URL 字符串为组件对象。
 * @param url - 需要解析的 URL 字符串。
 * @returns 包含解析后 URL 组件的对象。
 */
export function urlParse(url: string): URLObject {
  const urlPattern = /^(((.*?:)?\/\/)?((.*?):(.*?)@)?([^/]*?)(:(\d+))?)?(\/.*?)?(\?(.+?))?(#(.*))?$/;
  const matches = url.match(urlPattern) || [];
  const protocol = matches[3] || '';
  const username = matches[5] || '';
  const password = matches[6] || '';
  const hostname = matches[7] || '';
  const port = matches[9] || '';
  const pathname = matches[10] || '';
  const search = matches[11] || '';
  const hash = matches[13] || '';
  const host = `${hostname}${port ? `:${port}` : ''}`;

  return {
    protocol,
    host,
    hostname,
    port,
    pathname,
    search,
    hash,
    username,
    password,
    origin: protocol && host ? `${protocol}//${host}` : '',
  };
}

/**
 * 将 URLInfo 对象转换回 URL 字符串。
 * @param url - 需要转换的 URLInfo 对象。
 * @returns 转换后的 URL 字符串。
 */
export function urlStringify(url: URLObject) {
  const { protocol, hostname, port, pathname, search, hash, username, password } = url;
  return [
    protocol ? `${protocol}//` : '',
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
