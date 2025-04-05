/**
 * HEX颜色字符串类型（带#前缀）
 * @example "#ff0000" // 红色
 * @example "#0f0"    // 绿色简写
 */
export type HEX = `#${string}`;

/**
 * RGB颜色空间类型
 * @property r 红色分量（0-255）
 * @property g 绿色分量（0-255）
 * @property b 蓝色分量（0-255）
 * @example {r: 255, g: 0, b: 0} // 纯红色
 */
export type RGB = { r: number; g: number; b: number };

/**
 * HSV/HSB颜色空间类型
 * @property h 色相（0-360度）
 * @property s 饱和度（0-100%）
 * @property v 明度（0-100%）
 * @see https://zh.wikipedia.org/wiki/HSL%E5%92%8CHSV%E8%89%B2%E5%BD%A9%E7%A9%BA%E9%97%B4
 * @example {h: 0, s: 100, v: 100} // 纯红色
 */
export type HSV = { h: number; s: number; v: number };

/**
 * HSL颜色空间类型
 * @property h 色相（0-360度）
 * @property s 饱和度（0-100%）
 * @property l 亮度（0-100%）
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl
 * @example {h: 120, s: 100, l: 50} // 纯绿色
 */
export type HSL = { h: number; s: number; l: number };

/**
 * HWB颜色空间类型（W3C标准）
 * @property h 色相（0-360度）
 * @property w 白度（0-100%）
 * @property b 黑度（0-100%）
 * @see https://zh.wikipedia.org/zh-hans/HWB%E8%89%B2%E5%BD%A9%E7%A9%BA%E9%97%B4
 * @example {h: 0, w: 0, b: 0} // 纯红色
 */
export type HWB = { h: number; w: number; b: number };

/**
 * CIE LAB颜色空间类型（L*a*b*）
 * @property l 明度（0-100）
 * @property a 绿-红分量（典型范围-128到127）
 * @property b 蓝-黄分量（典型范围-128到127）
 * @see https://zh.m.wikipedia.org/wiki/CIELAB%E8%89%B2%E5%BD%A9%E7%A9%BA%E9%97%B4
 * @example {l: 53.24, a: 80.09, b: 67.20} // 亮红色
 */
export type LAB = { l: number; a: number; b: number };

/**
 * CIE 1931 XYZ颜色空间类型
 * @property x XYZ三刺激值X分量
 * @property y XYZ三刺激值Y分量（亮度基准）
 * @property z XYZ三刺激值Z分量
 * @see // https://zh.m.wikipedia.org/wiki/CIE_1931%E8%89%B2%E5%BD%A9%E7%A9%BA%E9%97%B4
 * @example {x: 95.047, y: 100.0, z: 108.883} // D65标准白点
 */
export type XYZ = { x: number; y: number; z: number };
