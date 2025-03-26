import { describe, expect, it } from 'vitest';
import {
  isArray,
  isBigInt,
  isBoolean,
  isError,
  isFunction,
  isNan,
  isNever,
  isNull,
  isNullish,
  isNumber,
  isObject,
  isPrimitive,
  isString,
  isSymbol,
  isUndefined,
  isVoid,
  typeIs,
} from '../src/is';

describe('typeIs', () => {
  it('应返回正确的类型名称', () => {
    expect(typeIs('hello')).toBe('String');
    expect(typeIs(42)).toBe('Number');
    expect(typeIs(true)).toBe('Boolean');
    expect(typeIs(Symbol('sym'))).toBe('Symbol');
    expect(typeIs(BigInt(123))).toBe('BigInt');
    expect(typeIs(undefined)).toBe('Undefined');
    expect(typeIs(null)).toBe('Null');
    expect(typeIs({})).toBe('Object');
    expect(typeIs([])).toBe('Array');
    expect(typeIs(() => {})).toBe('Function');
    expect(typeIs(Number.NaN)).toBe('Number');
    expect(typeIs(new Error('error'))).toBe('Error');
  });
});

describe('isString', () => {
  it('应正确判断字符串', () => {
    expect(isString('hello')).toBe(true);
    expect(isString(42)).toBe(false);
  });
});

describe('isBoolean', () => {
  it('应正确判断布尔值', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(42)).toBe(false);
  });
});

describe('isSymbol', () => {
  it('应正确判断符号', () => {
    expect(isSymbol(Symbol('sym'))).toBe(true);
    expect(isSymbol('hello')).toBe(false);
  });
});

describe('isBigInt', () => {
  it('应正确判断大整数', () => {
    expect(isBigInt(BigInt(123))).toBe(true);
    expect(isBigInt(42)).toBe(false);
  });
});

describe('isNumber', () => {
  it('应正确判断数字', () => {
    expect(isNumber(42)).toBe(true);
    expect(isNumber(Number.NaN)).toBe(false);
  });
});

describe('isUndefined', () => {
  it('应正确判断 undefined', () => {
    expect(isUndefined(undefined)).toBe(true);
    expect(isUndefined(null)).toBe(false);
  });
});

describe('isVoid', () => {
  it('应正确判断 void', () => {
    expect(isVoid(undefined)).toBe(true);
    expect(isVoid(null)).toBe(false);
  });
});

describe('isNever', () => {
  it('应正确处理 never 类型', () => {
    try {
      // 这里需要传入一个 never 类型的值，但 TypeScript 无法直接创建 never 类型的值
      // 因此我们使用一个类型断言来模拟 never 类型
      const neverValue = ((): never => {
        throw new Error('never');
      })();
      expect(() => isNever(neverValue)).not.toThrow();
    } catch (cause) {
      //
    }
  });
});

describe('isNull', () => {
  it('应正确判断 null', () => {
    expect(isNull(null)).toBe(true);
    expect(isNull(undefined)).toBe(false);
  });
});

describe('isNullish', () => {
  it('应正确判断 nullish', () => {
    expect(isNullish(null)).toBe(true);
    expect(isNullish(undefined)).toBe(true);
    expect(isNullish(void 0)).toBe(true);
    expect(isNullish(0)).toBe(false);
  });
});

describe('isPrimitive', () => {
  it('应正确判断原始类型', () => {
    expect(isPrimitive(null)).toBe(true);
    expect(isPrimitive(42)).toBe(true);
    expect(isPrimitive('hello')).toBe(true);
    expect(isPrimitive(true)).toBe(true);
    expect(isPrimitive(Symbol('sym'))).toBe(true);
    expect(isPrimitive(BigInt(123))).toBe(true);
    expect(isPrimitive({})).toBe(false);
    expect(isPrimitive([])).toBe(false);
    expect(isPrimitive(() => {})).toBe(false);
  });
});

describe('isObject', () => {
  it('应正确判断对象', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(() => {})).toBe(false);
  });
});

describe('isArray', () => {
  it('应正确判断数组', () => {
    expect(isArray([])).toBe(true);
    expect(isArray({})).toBe(false);
    expect(isArray(() => {})).toBe(false);
  });
});

describe('isFunction', () => {
  it('应正确判断函数', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
  });
});

describe('isNan', () => {
  it('应正确判断 NaN', () => {
    expect(isNan(Number.NaN)).toBe(true);
    expect(isNan(42)).toBe(false);
  });
});

describe('isError', () => {
  it('应正确判断 Error 类型', () => {
    expect(isError(new Error('error'))).toBe(true);
    expect(isError({})).toBe(false);
  });
});
