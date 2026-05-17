import {
  makeInterval,
  type TimerHandler,
  type TimerStateBase,
  type TimerState,
  type MakeIntervalOptions,
} from '@cloudcome/utils-core/timer';

/**
 * frameInterval 配置选项
 * @template T - condition 函数返回值类型
 */
export type FrameIntervalOptions<T> = {
  /**
   * 条件函数，每次执行前调用，返回值存入 state.data
   * 支持同步或异步返回值
   * 抛错时跳过本次 runner 执行，继续下一次调度
   */
  condition?: (state: TimerStateBase) => T;
  /**
   * 执行函数，每次 requestAnimationFrame 触发时调用，接收完整的定时器状态
   */
  runner: (state: TimerState<Awaited<T>>) => unknown;
  /**
   * 是否在定时器启动时立即执行一次，默认为 false
   */
  leading?: boolean;
  /**
   * 是否在定时器停止或暂停时额外执行一次（trailing edge）
   */
  trailing?: boolean;
};

/**
 * 创建一个基于 `requestAnimationFrame` 的间隔定时器
 *
 * @example
 * ```typescript
 * // 无 condition
 * frameInterval({
 *   runner: (state) => console.log(state.times),
 * })
 *
 * // 有 condition，T 自动推断为 number
 * frameInterval({
 *   condition: (state) => state.times,
 *   runner: (state) => state.data.toFixed(2),
 * })
 * ```
 *
 * @param options - 配置选项
 * @returns {TimerHandler} 返回包含控制方法的对象
 */
export function frameInterval<T = null>(options: FrameIntervalOptions<T>): TimerHandler {
  const { runner, condition, leading, trailing } = options;
  let rafId: number;
  const { canStart, start, canStop, stop, canPause, pause, canResume, resume, execute } = makeInterval({
    dispatcher: (call) => {
      rafId = requestAnimationFrame(call);
    },
    runner: runner as MakeIntervalOptions<T>['runner'],
    condition,
    leading: leading ?? false,
    trailing,
  });

  return {
    start() {
      if (!canStart()) return;
      start();
    },

    stop() {
      if (!canStop()) return;
      stop();
      cancelAnimationFrame(rafId);
    },

    pause() {
      if (!canPause()) return;
      pause();
      cancelAnimationFrame(rafId);
    },

    resume(immediate?: boolean) {
      if (!canResume()) return;
      if (immediate || leading) {
        resume();
      } else {
        rafId = requestAnimationFrame(() => resume());
      }
    },

    execute() {
      cancelAnimationFrame(rafId);
      execute();
    },
  };
}
