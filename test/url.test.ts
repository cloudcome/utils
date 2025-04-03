import { type URLObject, urlParse, urlStringify } from '../src/url';

describe('urlParse 函数', () => {
  it('应正确解析完整的 URL', () => {
    const url = 'https://user:pass@example.com:8080/path/to/resource?query=param#hash';
    const parsed = urlParse(url);
    expect(parsed).toEqual({
      hash: '#hash',
      host: 'example.com:8080',
      hostname: 'example.com',
      origin: 'https://example.com:8080',
      password: 'pass',
      pathname: '/path/to/resource',
      port: '8080',
      protocol: 'https:',
      search: '?query=param',
      username: 'user',
    });
  });

  it('应正确处理缺少部分组件的 URL', () => {
    const url = 'https://example.com/path/to/resource';
    const parsed = urlParse(url);
    expect(parsed).toEqual({
      hash: '',
      host: 'example.com',
      hostname: 'example.com',
      origin: 'https://example.com',
      password: '',
      pathname: '/path/to/resource',
      port: '',
      protocol: 'https:',
      search: '',
      username: '',
    });
  });

  it('应正确处理不完整的 URL：没有协议', () => {
    const url = 'example.com/path/to/resource';
    const parsed = urlParse(url);
    expect(parsed).toEqual({
      hash: '',
      host: 'example.com',
      hostname: 'example.com',
      origin: '',
      password: '',
      pathname: '/path/to/resource',
      port: '',
      protocol: '',
      search: '',
      username: '',
    });
  });

  it('应正确处理不完整的 URL：没有协议、域名', () => {
    const url = '/path/to/resource';
    const parsed = urlParse(url);
    expect(parsed).toEqual({
      hash: '',
      host: '',
      hostname: '',
      origin: '',
      password: '',
      pathname: '/path/to/resource',
      port: '',
      protocol: '',
      search: '',
      username: '',
    });
  });

  it('应正确处理不完整的 URL：只有域名', () => {
    const url = 'example.com';
    const parsed = urlParse(url);
    expect(parsed).toEqual({
      hash: '',
      host: 'example.com',
      hostname: 'example.com',
      origin: '',
      password: '',
      pathname: '',
      port: '',
      protocol: '',
      search: '',
      username: '',
    });
  });
});

describe('urlStringify 函数', () => {
  it('应正确将 URLComponents 对象转换为 URL 字符串', () => {
    const urlObj = {
      protocol: 'https:',
      hostname: 'example.com',
      port: '8080',
      pathname: '/path/to/resource',
      search: '?query=param',
      hash: '#hash',
      username: 'user',
      password: 'pass',
    } as URLObject;
    const url = urlStringify(urlObj);
    expect(url).toBe('https://user:pass@example.com:8080/path/to/resource?query=param#hash');
  });

  it('应正确处理缺少部分组件的 URLInfo 对象', () => {
    const urlObj = {
      protocol: 'https:',
      hostname: 'example.com',
      pathname: '/path/to/resource',
    } as URLObject;
    const url = urlStringify(urlObj);
    expect(url).toBe('https://example.com/path/to/resource');
  });

  it('没有协议', () => {
    const urlObj = {
      hostname: 'example.com',
      pathname: '/path/to/resource',
    } as URLObject;
    const url = urlStringify(urlObj);
    expect(url).toBe('example.com/path/to/resource');
  });

  it('只有域名', () => {
    const urlObj = {
      hostname: 'example.com',
    } as URLObject;
    const url = urlStringify(urlObj);
    expect(url).toBe('example.com');
  });

  it('只有路径', () => {
    const urlObj = {
      pathname: '/path/to/resource',
    } as URLObject;
    const url = urlStringify(urlObj);
    expect(url).toBe('/path/to/resource');
  });
});
