import { isInteger, isNumerical } from './regexp';
import { isUndefined } from './type';

/**
 * 表示包含主版本号、次版本号和修订号的对象
 */
export type VersionObject = {
  /**
   * 主版本号，当有不兼容的API修改时递增
   */
  major: number;
  /**
   * 次版本号，当有向下兼容的功能新增时递增
   */
  minor: number;
  /**
   * 修订号，当有向下兼容的问题修正时递增
   */
  patch: number;
};

/**
 * 将数字转换为安全的数值，如果输入为NaN则返回0
 * @param pos - 位置描述，用于错误提示
 * @param str - 要转换的数字字符串
 * @returns 安全的数字（如果输入为NaN则返回0）
 */
function internal_numerical(pos: string, str?: string) {
  if (isUndefined(str)) throw new Error(`${pos}不存在`);
  if (!isInteger(str)) throw new Error(`${pos}不是整数`);
  const num = Number(str);
  if (num < 0) throw new Error(`${pos}不是正整数`);
  return num;
}

/**
 * 将语义化版本号字符串解析为VersionObject对象
 * @param version - 要解析的版本号字符串 (例如 "1.2.3")
 * @returns 包含主版本号、次版本号和修订号的对象
 * @throws 如果版本号字符串格式无效将抛出错误
 */
export function versionParse(version: string): VersionObject {
  const parts = version.split('.');

  if (parts.length !== 3) {
    throw new Error('版本号格式不正确');
  }

  const [major, minor, patch] = parts;

  return {
    major: internal_numerical('主版本号', major),
    minor: internal_numerical('次版本号', minor),
    patch: internal_numerical('修订号', patch),
  };
}

/**
 * 比较两个语义化版本号字符串
 * @param version1 - 要比较的第一个版本号字符串
 * @param version2 - 要比较的第二个版本号字符串
 * @returns 如果version1较大返回1，version2较大返回-1，相等返回0
 * @throws 如果任一版本号字符串格式无效将抛出错误
 */
export function versionCompare(version1: string, version2: string): number {
  const vo1 = versionParse(version1);
  const vo2 = versionParse(version2);
  const order: (keyof VersionObject)[] = ['major', 'minor', 'patch'];

  for (const key of order) {
    const n1 = vo1[key];
    const n2 = vo2[key];

    if (n1 > n2) {
      return 1;
    }

    if (n1 < n2) {
      return -1;
    }
  }

  return 0;
}
