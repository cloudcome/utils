import { describe, expect, it } from 'vitest';
import { versionCompare, versionParse } from '../src/version';

describe('版本号工具函数测试', () => {
  describe('versionParse 函数', () => {
    it('应正确解析标准版本号', () => {
      const result = versionParse('1.2.3');
      expect(result).toEqual({ major: 1, minor: 2, patch: 3 });
    });

    it('应正确解析包含零的版本号', () => {
      const result = versionParse('0.0.0');
      expect(result).toEqual({ major: 0, minor: 0, patch: 0 });
    });

    it('当包含多余的版本号部分时应抛出错误', () => {
      expect(() => versionParse('1.2.3.4')).toThrow('版本号格式不正确');
    });

    it('当缺失修订号时应抛出错误', () => {
      expect(() => versionParse('1.2')).toThrow('版本号格式不正确');
    });

    it('当缺失次版本号时应抛出错误', () => {
      expect(() => versionParse('1')).toThrow('版本号格式不正确');
    });

    it('当版本号包含非数字字符时应抛出错误', () => {
      expect(() => versionParse('1.a.3')).toThrow('次版本号不是整数');
    });

    it('当版本号包含负数时应抛出错误', () => {
      expect(() => versionParse('1.2.-3')).toThrow('修订号不是正整数');
    });

    it('当传入空字符串时应抛出错误', () => {
      expect(() => versionParse('')).toThrow('版本号格式不正确');
    });
  });

  describe('versionCompare 函数', () => {
    it('应正确比较主版本号', () => {
      expect(versionCompare('2.0.0', '1.0.0')).toBe(1);
      expect(versionCompare('1.0.0', '2.0.0')).toBe(-1);
    });

    it('应正确比较次版本号', () => {
      expect(versionCompare('1.2.0', '1.1.0')).toBe(1);
      expect(versionCompare('1.1.0', '1.2.0')).toBe(-1);
    });

    it('应正确比较修订号', () => {
      expect(versionCompare('1.2.3', '1.2.2')).toBe(1);
      expect(versionCompare('1.2.2', '1.2.3')).toBe(-1);
    });

    it('应处理相等版本号', () => {
      expect(versionCompare('1.2.3', '1.2.3')).toBe(0);
    });

    it('当比较不完整版本号时应抛出错误', () => {
      expect(() => versionCompare('1.2', '1.2.0')).toThrow('版本号格式不正确');
      expect(() => versionCompare('1', '1.0.0')).toThrow('版本号格式不正确');
    });

    it('当比较无效版本号时应抛出错误', () => {
      expect(() => versionCompare('1.a.3', '1.0.0')).toThrow(
        '次版本号不是整数',
      );
    });
  });
});
