import { type TTimerHandler, type TTimerOptions, type TTimerState, makeInterval } from '@cloudcome/utils-core/timer';

/**
 * 创建一个基于 `requestAnimationFrame` 的间隔定时器
 *
 * @param callback - 每次间隔执行的回调函数，接收定时器状态和可选的 `next` 函数
 * @param options - 配置选项
 * @returns {TTimerHandler} 返回包含控制方法的对象
 */
export function frameInterval(
  callback: (state: TTimerState, next?: () => void) => unknown,
  options?: TTimerOptions,
): TTimerHandler {
  let rafId: number;
  const { canStart, start, canStop, stop, canPause, pause, canResume, resume, execute } = makeInterval((call) => {
    rafId = requestAnimationFrame(call);
  }, callback);

  return {
    start() {
      if (!canStart()) return;

      if (options?.leading) {
        start();
      } else {
        rafId = requestAnimationFrame(start);
      }
    },

    stop() {
      if (!canStop()) return;
      if (options?.trailing) execute();

      cancelAnimationFrame(rafId);
      stop();
    },

    pause() {
      if (!canPause()) return;
      if (options?.trailing) execute();

      cancelAnimationFrame(rafId);
      pause();
    },

    resume(immediate?: boolean) {
      if (!canResume()) return;

      if (immediate || options?.leading) {
        resume();
      } else {
        rafId = requestAnimationFrame(resume);
      }
    },
  };
}
