export interface IntervalTimer {
  times: number;
  startAt?: Date;
  stopAt?: Date;
  pauseAt?: Date;
  resumeAt?: Date;
  currentAt?: Date;
  elapsedTime: number;
  intervalTime: number;
}

const STATUS_READY = 0;
const STATUS_START = 1;
const STATUS_PAUSE = 2;
const STATUS_STOP = 3;

function _makeInterval(
  nextTime: (call: () => void) => void,
  effect: (timer: IntervalTimer, next?: () => void) => unknown,
) {
  const now = Date.now();
  let startAt: Date;
  let lastAt: Date;
  let stopAt: Date;
  let pauseAt: Date;
  let resumeAt: Date;
  let times = 0;
  let status = STATUS_READY;

  const call = () => {
    if (status >= STATUS_PAUSE) return;

    const date = new Date();
    const now = date.getTime();
    const timer: IntervalTimer = {
      times: ++times,
      startAt,
      stopAt,
      pauseAt,
      resumeAt,
      currentAt: date,
      elapsedTime: now - (startAt?.getTime() || 0),
      intervalTime: now - (lastAt?.getTime() || 0),
    };
    lastAt = date;

    if (effect.length === 2) {
      effect(timer, () => {
        nextTime(call);
      });
    } else {
      effect(timer);
      nextTime(call);
    }
  };
  const start = () => {
    if (status !== STATUS_READY) return;
    status = STATUS_START;
    lastAt = startAt = new Date();
    call();
  };
  const stop = () => {
    if (status !== STATUS_START) return;
    status = STATUS_STOP;
    stopAt = new Date();
  };
  const pause = () => {
    if (status !== STATUS_START) return;
    status = STATUS_PAUSE;
    pauseAt = new Date();
  };
  const resume = () => {
    if (status !== STATUS_PAUSE) return;
    status = STATUS_START;
    lastAt = resumeAt = new Date();
    call();
  };

  return { start, stop, pause, resume };
}

/**
 * 创建一个可暂停、恢复的定时器
 * @param callback - 定时器回调函数，接收IntervalTimer对象和可选的next函数
 * @param interval - 定时器间隔时间，单位毫秒
 * @param immediate - 是否立即执行第一次回调，默认为false
 * @returns 返回一个包含控制方法的对象：
 *  - stop(): 停止定时器
 *  - pause(): 暂停定时器
 *  - resume(immediateResume?: boolean): 恢复定时器，immediateResume为true时立即执行回调
 */
export function timeInterval(
  callback: (timer: IntervalTimer, next?: () => void) => unknown,
  interval: number,
  immediate?: boolean,
) {
  let lastHandler: number | NodeJS.Timeout;
  const { start, stop, pause, resume } = _makeInterval((call) => {
    lastHandler = setTimeout(call, interval);
  }, callback);

  if (immediate) {
    start();
  } else {
    lastHandler = setTimeout(start, interval);
  }

  return {
    stop() {
      stop();
      clearTimeout(lastHandler);
    },
    pause() {
      pause();
      clearTimeout(lastHandler);
    },
    resume(immediateResume?: boolean) {
      if (immediate || immediateResume) {
        resume();
      } else {
        lastHandler = setTimeout(resume, interval);
      }
    },
  };
}
