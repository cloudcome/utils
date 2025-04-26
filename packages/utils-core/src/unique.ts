import { randomNumber } from './number';

let lastTimestamp = 0;
let lastSafePadding = 0;

/**
 * 生成一个唯一的 BigInt 值。
 *
 * @param randomLength - 可选参数，指定随机部分的长度，默认为 0。
 *                        如果大于 0，则会在结果中附加指定长度的随机数。
 * @returns 返回一个唯一的 BigInt 值，包含时间戳、随机部分（如果有）以及递增的填充值。
 */
export function uniqueBigInt(randomLength = 0): bigint {
  const now = Date.now();

  if (now !== lastTimestamp) {
    lastTimestamp = now;
    lastSafePadding = 0;
  }

  let randomPart = '';

  if (randomLength > 0) {
    const randomMin = 10 ** (randomLength - 1);
    const randomMax = 10 ** randomLength - 1;
    randomPart = String(randomNumber(randomMin, randomMax));
  }

  return BigInt(randomPart + lastSafePadding++ + now);
}
