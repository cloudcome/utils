import { type URLComponents, urlParse, urlStringify } from '../src/url';

describe('urlParse 函数', () => {
  it('应正确解析完整的 URL', () => {
    const url = 'https://user:pass@example.com:8080/path/to/resource?query=param#hash';
    const parsed = urlParse(url);
    expect(parsed.protocol).toBe('https:');
    expect(parsed.hostname).toBe('example.com');
    expect(parsed.host).toBe('example.com:8080');
    expect(parsed.port).toBe('8080');
    expect(parsed.pathname).toBe('/path/to/resource');
    expect(parsed.search).toBe('?query=param');
    expect(parsed.hash).toBe('#hash');
    expect(parsed.username).toBe('user');
    expect(parsed.password).toBe('pass');
    expect(parsed.origin).toBe('https://example.com:8080');
    expect(parsed.href).toBe(url);
  });

  it('应正确处理缺少部分组件的 URL', () => {
    const url = 'https://example.com/path/to/resource';
    const parsed = urlParse(url);
    expect(parsed.protocol).toBe('https:');
    expect(parsed.hostname).toBe('example.com');
    expect(parsed.host).toBe('example.com');
    expect(parsed.port).toBe('');
    expect(parsed.pathname).toBe('/path/to/resource');
    expect(parsed.search).toBe('');
    expect(parsed.hash).toBe('');
    expect(parsed.username).toBe('');
    expect(parsed.password).toBe('');
    expect(parsed.origin).toBe('https://example.com');
    expect(parsed.href).toBe(url);
  });

  it('应正确处理不完整的 URL', () => {
    const url = '/path/to/resource';
    const parsed = urlParse(url);
    expect(parsed.protocol).toBe('');
    expect(parsed.hostname).toBe('');
    expect(parsed.host).toBe('');
    expect(parsed.port).toBe('');
    expect(parsed.pathname).toBe('/path/to/resource');
    expect(parsed.search).toBe('');
    expect(parsed.hash).toBe('');
    expect(parsed.username).toBe('');
    expect(parsed.password).toBe('');
    expect(parsed.origin).toBe('');
    expect(parsed.href).toBe(url);
  });
});

describe('urlStringify 函数', () => {
  it('应正确将 URLInfo 对象转换为 URL 字符串', () => {
    const urlInfo = {
      protocol: 'https:',
      hostname: 'example.com',
      port: '8080',
      pathname: '/path/to/resource',
      search: '?query=param',
      hash: '#hash',
      username: 'user',
      password: 'pass',
    } as URLComponents;
    const url = urlStringify(urlInfo);
    expect(url).toBe('https://user:pass@example.com:8080/path/to/resource?query=param#hash');
  });

  it('应正确处理缺少部分组件的 URLInfo 对象', () => {
    const urlInfo = {
      protocol: 'https:',
      hostname: 'example.com',
      pathname: '/path/to/resource',
    } as URLComponents;
    const url = urlStringify(urlInfo);
    expect(url).toBe('https://example.com/path/to/resource');
  });
});
