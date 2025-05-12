import { getStyle, setStyle } from '@/dom';
import { describe, expect, it, vi } from 'vitest';

describe('setStyle', () => {
  it('应该能够通过字符串设置样式', () => {
    const el = document.createElement('div');
    setStyle(el, 'color: red; background: blue;');

    expect(el.style.color).toBe('red');
    expect(el.style.background).toBe('blue');
  });

  it('应该能够通过对象设置样式', () => {
    const el = document.createElement('div');
    setStyle(el, { color: 'red', width: '16px' });

    expect(el.style.color).toBe('red');
    expect(el.style.width).toBe('16px');
  });

  it('应该能够设置自定义属性', () => {
    const el = document.createElement('div');
    setStyle(el, { '--custom-property': 'value' });

    expect(el.style.getPropertyValue('--custom-property')).toBe('value');
  });

  it('使用字符串设置样式时应覆盖现有样式', () => {
    const el = document.createElement('div');
    el.style.color = 'green';
    setStyle(el, 'color: red;');

    expect(el.style.color).toBe('red');
  });

  it('使用对象设置样式时应合并样式', () => {
    const el = document.createElement('div');
    el.style.color = 'green';
    setStyle(el, { width: '100px' });

    expect(el.style.color).toBe('green');
    expect(el.style.width).toBe('100px');
  });
});

describe('getStyle', () => {
  it('应该能够获取计算样式', () => {
    const el = document.createElement('div');
    el.style.color = 'red';

    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (prop: string) => (prop === 'color' ? 'red' : ''),
    } as CSSStyleDeclaration);

    expect(getStyle(el, 'color')).toBe('red');
  });

  it('对于不存在的属性应返回空字符串', () => {
    const el = document.createElement('div');

    const mockStyle = new CSSStyleDeclaration();
    vi.spyOn(mockStyle, 'getPropertyValue').mockReturnValue('');
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(mockStyle);

    expect(getStyle(el, 'color')).toBe('');
  });
});
