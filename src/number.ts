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
