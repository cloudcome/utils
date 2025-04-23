/**
 * 定时器状态接口
 */
export interface IIntervalState {
  /** 执行次数 */
  times: number;
  /** 开始时间戳 */
  startAt: number;
  /** 停止时间戳 */
  stopAt: number;
  /** 暂停时间戳 */
  pauseAt: number;
  /** 恢复时间戳 */
  resumeAt: number;
  /** 当前时间戳 */
  currentAt: number;
  /** 总耗时（包括暂停时间） */
  elapsedTime: number;
  /** 实际运行时间（不包括暂停时间） */
  runningTime: number;
  /** 当前间隔时间 */
  intervalTime: number;
}

const STATUS_READY = 0;
const STATUS_START = 1;
const STATUS_PAUSE = 2;
const STATUS_STOP = 3;

/**
 * 创建间隔定时器核心函数
 * @param nextTime - 用于安排下一次执行的函数
 * @param effect - 每次执行的回调函数，接收定时器状态和可选的next函数
 * @returns 返回包含控制方法的对象
 */
export function makeInterval(
  nextTime: (call: () => void) => void,
  effect: (timer: IIntervalState, next?: () => void) => unknown,
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
    const state: IIntervalState = {
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

export interface ITimerOptions {
  /** 是否在定时器开始时立即执行回调 */
  leading?: boolean;
  /** 是否在定时器停止时执行最后一次回调 */
  trailing?: boolean;
}

/**
 * 创建一个可暂停、恢复的定时器
 * @param callback - 定时器回调函数，接收定时器状态和可选的next函数
 * @param interval - 定时器间隔时间，单位毫秒
 * @param options - 定时器选项
 * @returns 返回一个包含控制方法的对象：
 *  - start(): 开始定时器
 *  - stop(): 停止定时器
 *  - pause(): 暂停定时器
 *  - resume(immediateResume?: boolean): 恢复定时器，immediateResume为true时立即执行回调
 */
export function timeInterval(
  callback: (state: IIntervalState, next?: () => void) => unknown,
  interval: number,
  options?: ITimerOptions,
) {
  let timeId: number | NodeJS.Timeout;
  const { canStart, canStop, canPause, canResume, start, stop, pause, resume, execute } = makeInterval((call) => {
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

/**
 * 创建一个基于requestAnimationFrame的定时器
 * @param callback - 定时器回调函数，接收定时器状态和可选的next函数
 * @param immediate - 是否立即执行第一次回调，默认为false
 * @returns 返回一个包含控制方法的对象：
 *  - stop(): 停止定时器
 *  - pause(): 暂停定时器
 *  - resume(immediateResume?: boolean): 恢复定时器，immediateResume为true时立即执行回调
 * @description 该定时器会在页面不可见时自动暂停，重新可见时自动恢复
 */
export function frameInterval(
  callback: (state: IIntervalState, next?: () => void) => unknown,
  options?: ITimerOptions,
) {
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
