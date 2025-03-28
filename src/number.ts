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
