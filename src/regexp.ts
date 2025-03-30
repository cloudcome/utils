const specialRE = /[.*+?^=!:${}()|[\]/\\-]/g;

/**
 * 编码处理正则表达式
 * @example
 * ```js
 * reEscape('/$')
 * // => '\\/\\$'
 * ```
 * @param {string} string
 * @returns {string}
 */
export function regexpEscape(string: string): string {
  return string.replace(specialRE, '\\$&');
}
