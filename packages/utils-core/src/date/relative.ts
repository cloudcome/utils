import { stringFormat } from '@/string';
import { isArray } from '@/type';
import { type DateValue, dateFormat, dateParse } from './core';

export type DateRelativeTemplate = [
  number /*单位时间差，为 0 表示不计算单位差值，单位秒*/,
  number /*最大时间差，单位：秒*/,
  string /*过去模板字符串，%d 表述单位差值*/,
  string? /*将来模板字符串，%d 表述单位差值，可选*/,
];
export type DateRelativeTemplates = DateRelativeTemplate[];

const defaultDiffTemplates: DateRelativeTemplates = [
  [0, 10, '刚刚'],
  [1, 60, '{n} 秒前', '{n} 秒后'],
  [60, 60 * 60, '{n} 分钟前', '{n} 分钟后'],
  [60 * 60, 60 * 60 * 24, '{n} 小时前', '{n} 小时后'],
  [0, 60 * 60 * 24 * 2, '昨天', '明天'],
  [0, 60 * 60 * 24 * 3, '前天', '后天'],
  [60 * 60 * 24, 60 * 60 * 24 * 30, '{n} 天前', '{n} 天后'],
  [0, Number.POSITIVE_INFINITY, 'YYYY年MM月DD日'],
];

/**
 * 相对时间
 * @param {DateValue} dateValue 比较的时间
 * @param {DateValue} [refDateValue] 相对的时间，默认为当前
 * @param {DateRelativeTemplates} [templates] 模板
 * @returns {string} 格式化后的相对时间字符串
 * @example
 * ```typescript
 * // 默认模板
 * dateRelative(new Date('2023-01-01')); // '刚刚'
 * dateRelative(new Date('2023-01-01'), new Date('2023-01-02')); // '昨天'
 * dateRelative(new Date('2023-01-01'), new Date('2023-01-04')); // '3 天前'
 * dateRelative(new Date('2023-01-01'), new Date('2023-02-01')); // '2023年01月01日'
 * ```
 * @example
 * ```typescript
 * // 自定义模板
 * const templates: DateRelativeTemplates = [
 *   [0, 10, '刚刚'],
 *   [1, 60, '{n} 秒前', '{n} 秒后'],
 *   [60, 60 * 60, '{n} 分钟前', '{n} 分钟后'],
 *   [60 * 60, 60 * 60 * 24, '{n} 小时前', '{n} 小时后'],
 *   [0, 60 * 60 * 24 * 2, '昨天', '明天'],
 *   [0, 60 * 60 * 24 * 3, '前天', '后天'],
 *   [60 * 60 * 24, 60 * 60 * 24 * 30, '{n} 天前', '{n} 天后'],
 *   [0, Number.POSITIVE_INFINITY, 'YYYY年MM月DD日'],
 * ];
 * dateRelative(new Date('2023-01-01'), new Date('2023-01-02'), templates); // '昨天'
 * dateRelative(new Date('2023-01-01'), new Date('2023-01-04'), templates); // '3 天前'
 * dateRelative(new Date('2023-01-01'), new Date('2023-02-01'), templates); // '2023年01月01日'
 * ```
 */
export function dateRelative(
  dateValue: DateValue,
  refDateValue: DateValue,
  templates: DateRelativeTemplates,
): string;
export function dateRelative(
  dateValue: DateValue,
  refDateValue: DateValue,
): string;
export function dateRelative(
  dateValue: DateValue,
  templates: DateRelativeTemplates,
): string;
export function dateRelative(dateValue: DateValue): string;
export function dateRelative(
  dateValue: DateValue,
  refDateValue?: DateValue | DateRelativeTemplates,
  templates?: DateRelativeTemplates,
): string {
  const now = Date.now();
  const refDateValueFinal = isArray(refDateValue) ? now : refDateValue || now;
  const templatesFinal = isArray(templates)
    ? templates
    : isArray(refDateValue)
      ? refDateValue
      : defaultDiffTemplates;
  const d1 = dateParse(dateValue);
  const d2 = dateParse(refDateValueFinal);
  const diff = d1.getTime() - d2.getTime();
  const isAgo = diff < 0;
  const absDiff = Math.abs(diff);
  let relative = '';

  for (const [base, max, agoTemplate, featureTemplate] of templatesFinal) {
    const unitFinal = base * 1000;
    const maxFinal = max * 1000;

    if (absDiff < maxFinal) {
      const template = isAgo ? agoTemplate : featureTemplate || agoTemplate;
      const length =
        unitFinal === 0 ? 0 : Math.max(Math.floor(absDiff / unitFinal), 1);
      relative =
        unitFinal === 0
          ? dateFormat(dateValue, template)
          : stringFormat(template, { n: length });
      break;
    }
  }

  return relative;
}
