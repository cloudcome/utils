/**
 * 定时器状态接口
 */
export type TimerState = {
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

export type TimerHandler = {
  /**
   * 开始
   */
  start: () => void;
  /**
   * 暂停
   */
  pause: () => void;
  /**
   * 恢复
   */
  resume: (immediate?: boolean) => void;
  /**
   * 停止
   */
  stop: () => void;
};

const STATUS_READY = 0;
const STATUS_START = 1;
const STATUS_PAUSE = 2;
const STATUS_STOP = 3;

/**
 * 创建间隔定时器核心函数
 *
 * @param nextTime - 用于安排下一次执行的函数
 * @param effect - 每次执行的回调函数，接收定时器状态和可选的next函数
 * @returns 返回包含控制方法的对象
 */
export function makeInterval(
  nextTime: (call: () => void) => void,
  effect: (timer: TimerState, next?: () => void) => unknown,
) {
  let startAt = 0;
  let lastAt = 0;
  let stopAt = 0;
  let pauseAt = 0;
  let resumeAt = 0;
  let times = 0;
  let status = STATUS_READY;
  let runningTime = 0;

  const execute = () => {
    if (status >= STATUS_PAUSE) return;

    const now = Date.now();
    const intervalTime = lastAt > 0 ? now - lastAt : 0;
    runningTime += intervalTime;
    lastAt = now;
    const state: TimerState = {
      times: ++times,
      startAt,
      stopAt,
      pauseAt,
      resumeAt,
      currentAt: now,
      elapsedTime: startAt > 0 ? now - startAt : 0,
      runningTime,
      intervalTime,
    };

    if (effect.length === 2) {
      effect(state, () => {
        nextTime(execute);
      });
    } else {
      effect(state);
      nextTime(execute);
    }
  };

  const canStart = () => status === STATUS_READY;
  const start = () => {
    if (!canStart()) return;
    status = STATUS_START;
    startAt = Date.now();
    execute();
  };

  const canStop = () => status === STATUS_START;
  const stop = () => {
    if (!canStop()) return;
    status = STATUS_STOP;
    stopAt = Date.now();
  };

  const canPause = () => status === STATUS_START;
  const pause = () => {
    if (!canPause()) return;
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

export type TimerOptions = {
  /**
   * 是否在定时器开始时立即执行回调
   */
  leading?: boolean;
  /**
   * 是否在定时器停止时执行最后一次回调
   */
  trailing?: boolean;
};

/**
 * 创建一个基于 `setTimeout` 的间隔定时器
 *
 * @param callback - 每次间隔执行的回调函数，接收定时器状态和可选的 `next` 函数
 * @param interval - 间隔时间，单位为毫秒
 * @param options - 配置选项
 * @returns {TimerHandler}
 */
export function timeInterval(
  callback: (state: TimerState, next?: () => void) => unknown,
  interval: number,
  options?: TimerOptions,
): TimerHandler {
  let timeId: number | NodeJS.Timeout;
  const {
    canStart,
    canStop,
    canPause,
    canResume,
    start,
    stop,
    pause,
    resume,
    execute,
  } = makeInterval((call) => {
    timeId = setTimeout(call, interval);
  }, callback);

  return {
    start() {
      if (!canStart()) return;

      if (options?.leading) {
        start();
      } else {
        timeId = setTimeout(start, interval);
      }
    },

    stop() {
      if (!canStop()) return;
      if (options?.trailing) execute();

      clearTimeout(timeId);
      stop();
    },

    pause() {
      if (!canPause()) return;
      if (options?.trailing) execute();

      clearTimeout(timeId);
      pause();
    },

    resume(immediate?: boolean) {
      if (!canResume()) return;

      if (immediate || options?.leading) {
        resume();
      } else {
        timeId = setTimeout(resume, interval);
      }
    },
  };
}
