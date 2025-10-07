import { describe, expect, it } from 'vitest';
import { declareDict } from '../src/dict';

describe('枚举定义测试', () => {
  it('编译时测试', () => {
    const Status = declareDict<{ label: string; level: number }>().define({
      Pending: { value: 0, label: '待处理', level: 11 },
      Approved: { value: 1, label: '已批准', level: 22 },
    });

    assertType<0>(Status.Pending);
    assertType<1>(Status.Approved);

    assertType<{ key: 'Pending'; readonly value: 0; readonly label: '待处理'; level: 11 }>(Status.$Pending);
    assertType<{ key: 'Approved'; readonly value: 1; readonly label: '已批准'; level: 22 }>(Status.$Approved);

    assertType<{
      Pending: { readonly value: 0; readonly label: '待处理'; level: 11 };
      Approved: { readonly value: 1; readonly label: '已批准'; level: 22 };
    }>(Status.definition);
    assertType<{ value: 0 | 1; label: string; level: number; key: 'Pending' | 'Approved' }[]>(Status.descriptions);

    assertType<['Pending', 'Approved']>(Status.keys);
    assertType<2>(Status.length);
    assertType<[0, 1]>(Status.values);

    assertType<{
      readonly Pending: 0;
      readonly Approved: 1;
    }>(Status.kvRecord);
    assertType<{
      readonly 0: 'Pending';
      readonly 1: 'Approved';
    }>(Status.vkRecord);

    const klr = Status.toKeyRecord('label');
    assertType<Record<'Pending' | 'Approved', string>>(klr);
    const vlr = Status.toValRecord('level');
    assertType<Record<0 | 1, number>>(vlr);
  });

  it('运行时测试', () => {
    const Status = declareDict<{ label: string; level: number }>().define({
      Pending: { value: 0, label: '待处理', level: 11 },
      Approved: { value: 1, label: '已批准', level: 22 },
    });

    expect(Status.Pending).toBe(0);
    expect(Status.Approved).toBe(1);

    expect(Status.$Pending.value).toBe(0);
    expect(Status.$Approved.value).toBe(1);

    expect(Status.$Pending.key).toBe('Pending');
    expect(Status.$Approved.key).toBe('Approved');

    expect(Status.$Pending.label).toBe('待处理');
    expect(Status.$Pending.level).toBe(11);
    expect(Status.$Approved.label).toBe('已批准');
    expect(Status.$Approved.level).toBe(22);

    expect(Status.keys).toEqual(['Pending', 'Approved']);
    expect(Status.values).toEqual([0, 1]);
    expect(Status.length).toEqual(2);

    expect(Status.definition).toEqual({
      Pending: { value: 0, label: '待处理', level: 11 },
      Approved: { value: 1, label: '已批准', level: 22 },
    });
    expect(Status.descriptions).toEqual([
      { key: 'Pending', value: 0, label: '待处理', level: 11 },
      { key: 'Approved', value: 1, label: '已批准', level: 22 },
    ]);

    expect(Status.kvRecord).toEqual({
      Pending: 0,
      Approved: 1,
    });
    expect(Status.vkRecord).toEqual({
      0: 'Pending',
      1: 'Approved',
    });

    expect(Status.toKeyRecord('label')).toEqual({
      Pending: '待处理',
      Approved: '已批准',
    });
    expect(Status.toValRecord('level')).toEqual({
      0: 11,
      1: 22,
    });
  });

  it('枚举键名大写开头', () => {
    // 测试小写键名应该报错
    expect(() => {
      declareDict().define({
        // @ts-expect-error 错误：枚举键名 active 必须以大写字母开头
        active: { value: 1 },
      });
    }).toThrowError('错误：枚举键名 active 必须以大写字母开头');
  });

  it('枚举键名非 $ 开头', () => {
    // 测试小写键名应该报错
    expect(() => {
      declareDict().define({
        // @ts-expect-error 错误：枚举键名 $active 不能以 $ 符号开头
        $active: { value: 1 },
      });
    }).toThrowError('错误：枚举键名 $active 不能以 $ 符号开头');
  });
});
