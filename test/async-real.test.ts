import { asyncLimit } from '@/async';
import { createAfn } from './helpers';

describe('asyncLimit 异常', () => {
  it('应正确处理拒绝的 Promise', async () => {
    const reason = Math.random().toString();
    // const afn = createAfn({
    //   timeout: 0,
    //   reason: reason,
    // });
    // const p = afn();
    // await expect(p).rejects.toEqual(reason);

    const fn = vi.fn();
    const result = asyncLimit(
      [
        createAfn({
          delay: 100,
          result: 1,
        }),
        createAfn({
          delay: 10,
          reason: reason,
        }),
        // 并发 2，第 2 个 promise 提早报错后将不会再继续执行
        createAfn({
          delay: 1,
          result: 3,
          onFinally: fn,
        }),
      ],
      2,
    );

    await expect(result).rejects.toThrow(reason);
    expect(fn).not.toHaveBeenCalled();
  });
});
