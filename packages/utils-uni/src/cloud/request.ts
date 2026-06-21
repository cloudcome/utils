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
  data?: AnyObject | string | ArrayBuffer;

  /**
   * 返回数据格式
   * - 'json':  将响应解析为 JSON 对象，raw 为原始 JSON 字符串
   * - 'buffer': 返回原始 Buffer 数据，raw 为 Buffer
   * @default 'json'
   */
  dataType?: 'json' | 'buffer';

  /**
   * 上传数据的格式，设为 'json' 会自动在 header 内设置 Content-Type: application/json
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
 * UniCloud Request 响应对象
 */
export type UniResponse<T, R = string> = {
  /**
   * 原始响应数据
   */
  raw: R;
  /**
   * 响应数据
   */
  data: T;
  /**
   * 响应状态码
   */
  status: number;
  /**
   * 响应头
   */
  headers: Record<string, string>;
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
export async function request<T>(options: RequestOptions & { dataType?: 'json' }): Promise<UniResponse<T, string>>;
export async function request<T>(options: RequestOptions & { dataType: 'buffer' }): Promise<UniResponse<T, Buffer>>;
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

  const httpOptions: Record<string, unknown> = {
    method,
    headers,
    data,
    contentType,
    timeout,
  };
  if (dataType === 'json') {
    httpOptions.dataType = 'text';
  }

  // 使用uniCloud.httpclient发起请求
  // @ts-expect-error: uniCloud类型定义中可能缺少httpclient属性
  const res = await uniCloud.httpclient.request(fullUrl, httpOptions);

  res.raw = res.data;

  if (dataType === 'json') {
    res.data = JSON.parse(res.data);
  }

  return res as unknown as UniResponse<T, string | Buffer>;
}
