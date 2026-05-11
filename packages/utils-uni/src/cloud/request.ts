import { qsStringify } from '@cloudcome/utils-core/qs';
import type { AnyObject } from '@cloudcome/utils-core/types';

/**
 * HTTP 请求配置选项
 */
export type RequestOptions = {
  /**
   * 请求 URL 地址
   */
  url: string;

  /**
   * URL 查询参数，会自动拼接到 url 后面
   */
  query?: Record<string, string>;

  /**
   * HTTP 请求方法
   * @default 'GET'
   */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';

  /**
   * 请求头
   */
  headers?: Record<string, string>;

  /**
   * 请求体数据
   */
  data?: AnyObject;

  /**
   * 返回数据格式
   * @default 'json'
   */
  dataType?: string;

  /**
   * 请求内容类型
   * - 'json': application/json
   * - 'form': application/x-www-form-urlencoded
   * @default 'json'
   */
  contentType?: string;

  /**
   * 请求超时时间，单位毫秒
   * @default 10000
   */
  timeout?: number;
};

/**
 * 发起 HTTP 请求
 *
 * 基于 uniCloud.httpclient 发起 HTTP 请求，支持 GET、POST、PUT、DELETE 等方法。
 * 查询参数会自动通过 qsStringify 拼接到 URL 上。
 *
 * @template T - 响应数据的类型
 * @param options 请求配置选项
 * @returns 包含 data、status、headers 的响应对象
 *
 * @example
 * ```ts
 * // GET 请求
 * const res = await request<{ name: string }>({
 *   url: 'https://api.example.com/users/1',
 * })
 * console.log(res.data) // { name: 'Alice' }
 * console.log(res.status) // 200
 *
 * // POST 请求
 * const res = await request<{ id: string }>({
 *   url: 'https://api.example.com/users',
 *   method: 'POST',
 *   data: { name: 'Alice', age: 25 },
 * })
 *
 * // 带查询参数
 * const res = await request<{ list: any[] }>({
 *   url: 'https://api.example.com/users',
 *   query: { page: '1', size: '10' },
 * })
 * ```
 */
export async function request<T>(options: RequestOptions) {
  const {
    url,
    query = {},
    method = 'GET',
    headers = {},
    data,
    dataType = 'json',
    contentType = 'json',
    timeout = 10000,
  } = options;

  const fullUrl = `${url}?${qsStringify(query)}`;

  // 使用uniCloud.httpclient发起请求
  // @ts-expect-error: uniCloud类型定义中可能缺少httpclient属性
  const res = await uniCloud.httpclient.request(fullUrl, {
    method,
    headers,
    data,
    dataType,
    contentType,
    timeout,
  });

  return res as { data: T; status: number; headers: Record<string, string> };
}
