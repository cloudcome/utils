import { numberConvert, randomNumber } from './number';
import { STRING_DICT } from './string';
import { isNumber, isString } from './type';

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

const _randomChar = (dict: string): string => {
  const poolIndex = randomNumber(0, dict.length - 1);

  return dict[poolIndex];
};

/**
 * 生成一个唯一的字符串。
 *
 * @param minLength - 可选参数，指定生成字符串的最小长度。
 *                 如果未提供或为字符串类型，则使用默认长度。
 * @param dict - 可选参数，指定生成字符串时使用的字符集。
 *               如果未提供，则使用默认字符集 `STRING_DICT`。
 * @returns 返回一个唯一的字符串，包含时间戳、随机部分（如果有）以及递增的填充值。
 *          如果指定了 `length`，则返回值的长度将被调整到指定长度。
 */
export function uniqueString(minLength: number, dict: string): string;
export function uniqueString(minLength: number): string;
export function uniqueString(dict: string): string;
export function uniqueString(): string;
export function uniqueString(minLength?: number | string, dict?: string) {
  let finalLength = 0;
  let finalDict = STRING_DICT;

  if (isString(dict)) {
    finalLength = minLength as number;
    finalDict = dict;
  } else if (isNumber(minLength)) {
    finalLength = minLength;
  } else if (isString(minLength)) {
    finalDict = minLength;
  }

  let uniqueString = numberConvert(uniqueBigInt(), finalDict);
  let insertLength = finalLength - uniqueString.length;

  if (insertLength <= 0) return uniqueString;

  while (insertLength--) {
    uniqueString += _randomChar(finalDict);
  }

  return uniqueString;
}
