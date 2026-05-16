/**
 * URL 元信息
 */
export type UrlMeta = {
  /**
   * 协议部分，包含冒号，例如 "https:"。
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
};

/**
 * 解析 URL 字符串为组件对象。
 * @param url - 需要解析的 URL 字符串。
 * @returns 包含解析后 URL 组件的对象。
 */
export function urlParse(url: string): UrlMeta {
  let result: URL | null = null;

  try {
    // 添加 globalThis 是便于对接外部环境 URL 的自行实现
    // 例如在 uni-app、微信小程序等运行环境。
    result = new globalThis.URL(url);
  } catch {
    // ignore
  }

  const protocol = result?.protocol || '';
  const host = result?.host || '';

  return {
    protocol,
    host,
    hostname: result?.hostname || '',
    port: result?.port || '',
    pathname: result?.pathname || '',
    search: result?.search || '',
    hash: result?.hash || '',
    username: result?.username || '',
    password: result?.password || '',
  };
}

/**
 * 将 UrlMeta 对象转换回 URL 字符串。
 * @param url - 需要转换的 UrlMeta 对象。
 * @returns 转换后的 URL 字符串。
 */
export function urlStringify(url: UrlMeta) {
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
