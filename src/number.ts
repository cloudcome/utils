import { STRING_DICT } from './string';

/**
 * 生成指定范围内的随机整数
 * @param {number} min - 随机数的最小值（包含）
 * @param {number} max - 随机数的最大值（包含）
 * @returns {number} - 生成的随机整数
 */
export function randomNumber(min: number, max: number): number {
  const [minFinal, maxFinal] = min > max ? [max, min] : [min, max];
  return Math.floor(Math.random() * (maxFinal - minFinal + 1) + minFinal);
}

export type NumberAbbrOptions = {
  /**
   * 进制基数，用于计算单位进阶（如1000表示千进制）
   * @default 1000
   */
  base?: number;

  /**
   * 数值保留的小数位数
   * @default 0
   */
  fractionDigits?: number;
};

/**
 * 将数字转换为带单位缩写的字符串表示
 *
 * @param {number} number - 需要转换的原始数值
 * @param {Array<string>} units - 单位数组，按从小到大顺序排列（如['B','KB','MB']），不能为空
 * @param {NumberAbbrOptions} [options] - 可选配置参数
 * @param {number} [options.base=1000] - 进制基数，用于计算单位进阶（如1000表示千进制）
 * @param {number} [options.fractionDigits=0] - 数值保留的小数位数
 * @returns {string} - 转换后的带单位字符串（如"1.2KB"）
 * @example
 * // 基础用法
 * numberAbbr(1500, ['', 'K', 'M'], { base: 1000 }); // "1.5K"
 * @example
 * // 自定义小数位
 * numberAbbr(123456, ['B','KB','MB'], { fractionDigits: 1 }); // "0.1MB"
 * @example
 * // 处理不足基数的情况
 * numberAbbr(500, ['B','KB']); // "500B"
 */
export function numberAbbr(number: number, units: Array<string>, options?: NumberAbbrOptions): string {
  const { base = 1000, fractionDigits = 0 } = options || {};
  const { length } = units;

  if (length === 0) throw new Error('数字单位组不能为空');

  let numberFinal = number;
  let steps = 0;

  while (numberFinal >= base && steps < length - 1) {
    numberFinal = numberFinal / base;
    steps++;
  }

  const value = numberFinal.toFixed(fractionDigits);
  const unit = units[steps];

  return `${value.toString()}${unit}`;
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
