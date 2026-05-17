/**
 * 定时器状态基础接口
 */
export type TimerStateBase = {
  /**
   * 执行次数
   */
  times: number;
  /**
   * 开始时间戳
   */
  startAt: number;
  /**
   * 停止时间戳
   */
  stopAt: number;
  /**
   * 暂停时间戳
   */
  pauseAt: number;
  /**
   * 恢复时间戳
   */
  resumeAt: number;
  /**
   * 当前时间戳
   */
  currentAt: number;
  /**
   * 总耗时（包括暂停时间）
   */
  elapsedTime: number;
  /**
   * 实际运行时间（不包括暂停时间）
   */
  runningTime: number;
  /**
   * 当前间隔时间
   */
  intervalTime: number;
};

/**
 * 定时器状态接口
 * @template T - condition 函数返回值类型，默认为 unknown
 */
export type TimerState<T = unknown> = TimerStateBase & {
  /**
   * condition 函数返回值，未传入 condition 时为 null
   */
  data: T;
};

/**
 * 定时器控制方法集合
 */
export type TimerHandler = {
  /**
   * 启动定时器
   */
  start: () => void;
  /**
   * 暂停定时器
   */
  pause: () => void;
  /**
   * 恢复定时器
   * @param immediate - 是否立即执行一次
   */
  resume: (immediate?: boolean) => void;
  /**
   * 停止定时器
   */
  stop: () => void;
  /**
   * 清除上一次定时器，立即执行，并开始下一次定时器
   */
  execute: () => void;
};

/**
 * 间隔定时器控制方法集合，包含状态查询方法
 */
export type IntervalHandler = TimerHandler & {
  /**
   * 是否可以启动（处于 READY 状态）
   */
  canStart: () => boolean;
  /**
   * 是否可以停止（处于 START 状态）
   */
  canStop: () => boolean;
  /**
   * 是否可以暂停（处于 START 状态）
   */
  canPause: () => boolean;
  /**
   * 是否可以恢复（处于 PAUSE 状态）
   */
  canResume: () => boolean;
};

const STATUS_READY = 0;
const STATUS_START = 1;
const STATUS_PAUSE = 2;
const STATUS_STOP = 3;

/**
 * makeInterval 配置选项
 * @template T - condition 函数返回值类型
 */
export type MakeIntervalOptions<T> = {
  /**
   * 调度器函数，用于安排下一次执行
   */
  dispatcher: (dispatch: () => void) => unknown;
  /**
   * 条件函数，每次执行前调用，返回值存入 state.data
   * 使用 MaybePromise 支持同步或异步条件判断
   * 抛错时跳过本次 runner 执行，继续下一次调度
   */
  condition?: (state: TimerStateBase) => T;
  /**
   * 执行函数，每次定时器触发时调用，接收完整的定时器状态
   * 使用 NoInfer<T> 阻断对该参数的泛型推断，确保 T 仅从 condition 返回值推断
   */
  runner: (timer: TimerState<NoInfer<Awaited<T>>>) => unknown;
  /**
   * 是否在定时器启动时立即执行一次，默认为 true
   */
  leading?: boolean;
  /**
   * 是否在定时器停止或暂停时额外执行一次（trailing edge）
   */
  trailing?: boolean;
};

/**
 * 创建可控制的间隔定时器核心函数
 *
 * @example
 * ```typescript
 * // 无 condition，state.data 为 null
 * makeInterval({
 *   dispatcher: (dispatch) => setTimeout(dispatch, 1000),
 *   runner: (state) => console.log(state.times),
 * })
 *
 * // 有 condition，T 自动推断为 number
 * makeInterval({
 *   dispatcher: (dispatch) => setTimeout(dispatch, 1000),
 *   condition: (state) => state.times,
 *   runner: (state) => state.data.toFixed(2),
 * })
 * ```
 *
 * @param options - 配置选项
 * @returns 定时器控制方法集合
 */
export function makeInterval<T = null>(options: MakeIntervalOptions<T>): IntervalHandler {
  const { dispatcher, runner, condition, leading, trailing } = options;
  let startAt = 0;
  let lastAt = 0;
  let stopAt = 0;
  let pauseAt = 0;
  let resumeAt = 0;
  let times = 0;
  let status = STATUS_READY;
  let runningTime = 0;

  const execute = async () => {
    if (status >= STATUS_PAUSE) return;

    const now = Date.now();
    const intervalTime = lastAt > 0 ? now - lastAt : 0;
    runningTime += intervalTime;
    lastAt = now;
    const state: TimerState<T> = {
      times,
      startAt,
      stopAt,
      pauseAt,
      resumeAt,
      currentAt: now,
      elapsedTime: startAt > 0 ? now - startAt : 0,
      runningTime,
      intervalTime,
      data: null as T,
    };

    if (condition) {
      try {
        state.data = await condition(state);
      } catch {
        dispatcher(execute);
        return;
      }
    }

    state.times = ++times;

    await (runner as (timer: TimerState<T>) => unknown)(state);
    dispatcher(execute);
  };

  const canStart = () => status === STATUS_READY;
  const start = () => {
    if (!canStart()) return;
    status = STATUS_START;
    startAt = Date.now();
    if (leading === false) {
      dispatcher(execute);
    } else {
      execute();
    }
  };

  const canStop = () => status === STATUS_START;
  const stop = () => {
    if (!canStop()) return;
    if (trailing) execute();
    status = STATUS_STOP;
    stopAt = Date.now();
  };

  const canPause = () => status === STATUS_START;
  const pause = () => {
    if (!canPause()) return;
    if (trailing) execute();
    status = STATUS_PAUSE;
    pauseAt = Date.now();
  };

  const canResume = () => status === STATUS_PAUSE;
  const resume = () => {
    if (!canResume()) return;
    status = STATUS_START;
    resumeAt = Date.now();
    lastAt = resumeAt;
    execute();
  };

  return {
    canStart,
    canStop,
    canPause,
    canResume,
    start,
    stop,
    pause,
    resume,
    execute,
  };
}

/**
 * timerInterval 配置选项
 * @template T - condition 函数返回值类型
 */
export type TimerIntervalOptions<T> = {
  /**
   * 间隔时间，单位为毫秒
   */
  interval: number;
  /**
   * 条件函数，每次执行前调用，返回值存入 state.data
   * 抛错时跳过本次 runner 执行，继续下一次调度
   */
  condition?: (state: TimerStateBase) => T;
  /**
   * 执行函数，每次定时器触发时调用，接收完整的定时器状态
   */
  runner: (state: TimerState<NoInfer<Awaited<T>>>) => unknown;
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
 * 创建基于 setTimeout 的间隔定时器
 *
 * @example
 * ```typescript
 * // 无 condition
 * timerInterval({
 *   interval: 1000,
 *   runner: (state) => console.log(state.times),
 * })
 *
 * // 有 condition，T 自动推断为 number
 * timerInterval({
 *   interval: 1000,
 *   condition: (state) => state.times,
 *   runner: (state) => state.data.toFixed(2),
 * })
 * ```
 *
 * @param options - 配置选项
 * @returns 定时器控制方法集合
 */
export function timerInterval<T = null>(options: TimerIntervalOptions<T>): TimerHandler {
  const { runner, interval, condition, leading, trailing } = options;
  let timeId: number | NodeJS.Timeout;
  const { canStart, canStop, canPause, canResume, start, stop, pause, resume, execute } = makeInterval({
    dispatcher: (dispatch) => {
      timeId = setTimeout(dispatch, interval);
    },
    runner,
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
      clearTimeout(timeId);
    },

    pause() {
      if (!canPause()) return;
      pause();
      clearTimeout(timeId);
    },

    resume(immediate?: boolean) {
      if (!canResume()) return;
      if (immediate || leading) {
        resume();
      } else {
        timeId = setTimeout(() => resume(), interval);
      }
    },

    execute() {
      clearTimeout(timeId);
      execute();
    },
  };
}
