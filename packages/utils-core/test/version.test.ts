import { describe, expect, it } from 'vitest';
import { versionCompare, versionParse } from '../src/version';

describe('版本号工具函数测试', () => {
  describe('versionParse 函数', () => {
    it('应正确解析标准版本号', () => {
      const result = versionParse('1.2.3');
      expect(result).toEqual({ major: 1, minor: 2, patch: 3 });
    });

    it('应处理缺失的版本号部分', () => {
      const result = versionParse('1.2');
      expect(result).toEqual({ major: 1, minor: 2, patch: 0 });
    });

    it('应处理非数字字符', () => {
      const result = versionParse('1.a.3');
      expect(result).toEqual({ major: 1, minor: 0, patch: 3 });
    });

    it('应处理空字符串', () => {
      const result = versionParse('');
      expect(result).toEqual({ major: 0, minor: 0, patch: 0 });
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

    it('应处理不完整版本号', () => {
      expect(versionCompare('1.2', '1.2.0')).toBe(0);
      expect(versionCompare('1', '1.0.0')).toBe(0);
    });
  });
});
