import { objectDefaults } from './object';
import { STRING_DICT } from './string';
import { isNumber } from './type';

export type NumberFixedOptions = {
  /**
   * 保留的小数位数
   * @default 0
   */
  decimals?: number;

  /**
   * 舍入方法，0 为四舍五入，1 为向上取整，-1 为向下取整
   * @default 0
   */
  round?: 0 | 1 | -1;
};

/**
 * 对数字进行精确小数位数处理并按规则舍入
 * @param number 需要处理的原始数值
 * @param options 可选配置参数
 * @returns 处理后的数值（number类型）
 * @example
 * // 四舍五入示例
 * numberFixed(3.1415, { decimals: 2 }); // 3.14
 * // 向上取整示例
 * numberFixed(3.1415, { decimals: 2, round: 1 }); // 3.15
 * // 向下取整示例
 * numberFixed(3.9999, { decimals: 1, round: -1 }); // 3.9
 */
export function numberFixed(number: number, options?: NumberFixedOptions) {
  const { decimals = 0, round = 0 } = options || {};
  const scale = 10 ** decimals;

  if (round === 1) {
    return Math.ceil(number * scale) / scale;
  }

  if (round === -1) {
    return Math.floor(number * scale) / scale;
  }

  return Math.round(number * scale) / scale;
}

/**
 * 生成指定范围内的随机数
 * @param {number | string} min - 随机数的最小值（包含，支持小数、字符串）
 * @param {number | string} max - 随机数的最大值（包含，支持小数、字符串）
 * @returns {number} - 生成的随机数
 * @example
 * // 生成 1 到 10 之间的随机整数
 * randomNumber(1, 10); // 可能返回 7
 *
 * // 生成 0.1 到 2 之间的一位随机小数
 * randomNumber(0.1, 2); // 可能返回 0.7
 *
 * // 生成 0.10 到 2 之间的两位随机小数
 * randomNumber("0.10", 2); // 可能返回 0.75
 */
export function randomNumber(min: number | string, max: number | string): number {
  const minDecimals = numberDecimals(min);
  const maxDecimals = numberDecimals(max);
  const decimals = Math.max(minDecimals, maxDecimals);
  const scale = 10 ** decimals;

  const minNum = Number(min);
  const maxNum = Number(max);
  const [minFinal, maxFinal] = minNum > maxNum ? [maxNum, minNum] : [minNum, maxNum];

  const scaledMin = minFinal * scale;
  const scaledMax = maxFinal * scale;

  return Math.floor(Math.random() * (scaledMax - scaledMin + 1) + scaledMin) / scale;
}

/**
 * 数字缩写选项
 */
export type NumberAbbrOptions = {
  /**
   * 进制基数，用于计算单位进阶（如 1000 表示千进制）
   * @default 1000
   */
  base?: number;

  /**
   * 数值保留的小数位数
   * @default 0
   */
  decimals?: number;
};

/**
 * 将数字转换为带单位缩写的字符串表示
 *
 * @param {number} number - 需要转换的原始数值
 * @param {Array<string>} units - 单位数组，按从小到大顺序排列（如['B','KB','MB']），不能为空
 * @param {NumberAbbrOptions} [options] - 可选配置参数
 * @returns {string} - 转换后的带单位字符串（如"1.2KB"）
 * @example
 * // 基础用法
 * numberAbbr(1500, ['', 'K', 'M'], { base: 1000 }); // "1.5K"
 * @example
 * // 自定义小数位
 * numberAbbr(123456, ['B','KB','MB'], { decimals: 1 }); // "0.1MB"
 * @example
 * // 处理不足基数的情况
 * numberAbbr(500, ['B','KB']); // "500B"
 */
export function numberAbbr(number: number, units: Array<string>, options?: NumberAbbrOptions): string {
  const { base = 1000, decimals = 0 } = options || {};
  const { length } = units;

  if (length === 0) throw new Error('数字单位组不能为空');

  let numberFinal = number;
  let step = 0;

  while (numberFinal >= base && step < length - 1) {
    numberFinal = numberFinal / base;
    step++;
  }

  const value = numberFixed(numberFinal, { decimals: decimals, round: -1 });
  const unit = units[step];

  return `${value}${unit}`;
}

/**
 * 将文件大小转换为带单位缩写的字符串表示
 *
 * @param {number} number - 需要转换的文件大小数值
 * @param {number} [decimals=0] - 数值保留的小数位数
 * @returns {string} - 转换后的带单位字符串（如"1.2KB"）
 * @example
 * // 基础用法
 * fileSizeAbbr(1024); // "1KB"
 * @example
 * // 自定义小数位
 * fileSizeAbbr(123456, 1); // "0.1MB"
 */
export function fileSizeAbbr(number: number, decimals = 0) {
  return numberAbbr(number, ['B', 'KB', 'MB', 'GB', 'TB'], {
    base: 1024,
    decimals: decimals,
  });
}

/**
 * 将十进制数转换为指定进制的字符串表示
 *
 * @param {number | bigint} decimal - 需要转换的十进制数，可以是任意长度的数字或大整数
 * @param {string} [dict] - 用于表示进制的字符字典，默认为数字、小写字母和大写字母的组合（62 进制）
 * @returns {string} - 转换后的指定进制字符串
 * @throws {Error} - 如果字符字典的长度小于 2，将抛出错误
 * @example
 * // 默认 62 进制
 * numberConvert(123456789); // "8M0kX"
 * @example
 * // 自定义 16 进制
 * numberConvert(255, '0123456789ABCDEF'); // "FF"
 * @example
 * // 处理大整数
 * numberConvert(9007199254740991n); // "2gosa7pa2GV"
 */
export function numberConvert(decimal: number | bigint, dict?: string): string {
  const dictFinal = dict || STRING_DICT;

  if (dictFinal.length < 2) throw new Error('进制转换字典长度不能小于 2');

  let bigInt = BigInt(decimal);
  const symbol = bigInt < 0n ? '-' : '';
  bigInt = bigInt < 0n ? -bigInt : bigInt;
  const result: Array<string> = [];
  const { length } = dictFinal;
  const bigLength = BigInt(length);
  const calculate = (): void => {
    const y = Number(bigInt % bigLength);

    bigInt = bigInt / bigLength;
    result.unshift(dictFinal[y]);

    if (bigInt > 0) {
      calculate();
    }
  };

  calculate();

  return symbol + result.join('');
}

/**
 * 数字格式化配置选项
 */
export type NumberFormatOptions = {
  /**
   * 分隔符字符，用于数字分隔
   * @default ','
   * @example 使用 '_' 分隔符时，123456 会格式化为 '123_456'
   */
  separator?: string;

  /**
   * 分隔步长，即每隔多少位添加分隔符
   * @default 3
   * @example 步长为 2 时，123456 会格式化为 '12,34,56'
   */
  step?: number;
};

/**
 * 数字格式化
 * @param [number] {number} 数字
 * @param options {NumberFormatOptions} 格式化配置
 * @returns {string} 分割后的字符串
 * @example
 * // 使用默认分隔符和步长
 * numberFormat(123456.789); // => "123,456.789"
 * // 自定义分隔符
 * numberFormat(123456.789, '_'); // => "123_456.789"
 * // 自定义步长
 * numberFormat(123456.789, 2); // => "12,34,56.789"
 * // 使用对象配置
 * numberFormat(123456.789, { separator: '.', step: 4 }); // => "12.3456.789"
 */
export function numberFormat(number: number, options: NumberFormatOptions): string;
export function numberFormat(number: number, separator: string): string;
export function numberFormat(number: number, step: number): string;
export function numberFormat(number: number): string;
export function numberFormat(number: number, options?: NumberFormatOptions | string | number) {
  let optionsFinal: Required<NumberFormatOptions> = {
    separator: ',',
    step: 3,
  };

  if (typeof options === 'string') {
    optionsFinal.separator = options;
  } else if (typeof options === 'number') {
    optionsFinal.step = options;
  } else {
    optionsFinal = objectDefaults(options || {}, optionsFinal) as Required<NumberFormatOptions>;
  }

  const { separator, step } = optionsFinal;
  const arr = String(number).split('.');
  const re = new RegExp(`(\\d)(?=(\\d{${step}})+(?!\\d))`, 'g');
  const p1 = arr[0].replace(re, `$1${separator}`);

  return p1 + (arr[1] ? `.${arr[1]}` : '');
}

/**
 * 将数字限制在指定范围内。
 *
 * @param min - 最小值。
 * @param number - 要限制的数字。
 * @param max - 最大值。
 * @returns 限制后的数字。
 */
export function numberClamp(min: number, number: number, max: number) {
  return Math.min(Math.max(number, min), max);
}

/**
 * 为数字添加单位
 * @param number - 需要处理的数字，可以是数字类型或字符串类型
 * @param unit - 要添加的单位，默认为空字符串
 * @returns 如果输入是数字或纯数字字符串，则返回带单位的字符串；否则返回原值
 */
export function numberUnit(number: string | number, unit = '') {
  if (isNumber(number)) return `${number}${unit}`;
  if (/^-?[\d.]+$/.test(number)) return `${number}${unit}`;
  return number;
}

/**
 * 获取数字的小数位数
 * @param num - 需要计算小数位数的数字或数字字符串
 * @returns 返回数字的小数位数，如果是整数则返回0
 * @example
 * // 基本用法
 * numberDecimals(3.1415); // 4
 * numberDecimals("3.1415"); // 4
 * numberDecimals(100); // 0
 * numberDecimals("100"); // 0
 * // 科学计数法
 * numberDecimals("1.23e-4"); // 6
 */
export function numberDecimals(num: number | string) {
  const numStr = String(num);
  const matches = numStr.match(/(?:\.(\d+))?(?:e-(\d+))?$/i);
  if (!matches) return 0;
  return (matches[1] || '').length + Number.parseInt(matches[2] || '0');
}
