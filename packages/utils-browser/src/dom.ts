import { objectEach } from '@cloudcome/utils-core/object';

/**
 * 表示 CSS 样式声明的类型，仅包含可用的字符串或数字类型的属性
 * @typedef {Object} Style
 * @property {string | number} [K] - CSS 样式属性，K 为 CSSStyleDeclaration 的键名，且值为字符串或数字类型
 */
export type Style = {
  [K in keyof CSSStyleDeclaration as K extends number
    ? never
    : CSSStyleDeclaration[K] extends string | number
      ? K
      : never]: CSSStyleDeclaration[K];
};

/**
 * 设置元素的样式
 * @param {HTMLElement} el - 需要设置样式的 HTML 元素
 * @param {string | Partial<Style> | Record<string, string>} style - 样式字符串或样式对象
 * @example
 * // 设置 body 元素的颜色为红色，并设置一个自定义变量
 * setStyle(document.body, { color: 'red', '--var': 'value' });
 * @example
 * // 使用字符串设置样式
 * setStyle(document.body, 'color: red; --var: value;');
 */
export function setStyle(el: HTMLElement, style: string | Partial<Style> | Record<string, string>) {
  if (typeof style === 'string') {
    el.style.cssText = style;
  } else {
    objectEach(style, (value, key) => {
      el.style.setProperty(key as string, value as string | null);
    });
  }
}

/**
 * 获取元素的指定样式值
 * @param {HTMLElement} el - 需要获取样式的 HTML 元素
 * @param {keyof Style} style - 需要获取的样式属性
 * @returns {string} 返回指定样式的值
 * @example
 * // 获取 body 元素的颜色
 * const color = getStyle(document.body, 'color');
 */
export function getStyle(el: HTMLElement, style: keyof Style) {
  return window.getComputedStyle(el).getPropertyValue(style);
}
