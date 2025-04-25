import type { AnyFunction, AnyObject } from './types';

/**
 * 事件类型映射，key 为事件名称，value 为事件参数类型数组
 */
export type EmitterMap = Record<string, unknown[]>;

/**
 * 事件监听器函数类型
 * @template E - EmitterMap 类型
 * @template K - 事件名称类型
 */
export type EmitterListener<E extends EmitterMap, K extends keyof E> = (...args: E[K]) => false | unknown;

/**
 * 事件发射器类，用于管理事件监听和触发
 * @template E - 事件类型映射
 *
 * @example
 * type MyEvents = {
 *   'click': [x: number, y: number];
 *   'change': [value: string];
 * };
 *
 * const emitter = new Emitter<MyEvents>();
 * emitter.on('click', (x, y) => {
 *   console.log(`Clicked at (${x}, ${y})`);
 * });
 * emitter.emit('click', 10, 20);
 */
export class Emitter<E extends EmitterMap> {
  #events: Map<keyof E, Set<AnyFunction>> = new Map();

  /**
   * 注册事件监听器
   * @param event - 要监听的事件名称
   * @param listener - 事件监听器函数
   * @example
   * emitter.on('click', (x, y) => {
   *   console.log(`Clicked at (${x}, ${y})`);
   * });
   */
  on<K extends keyof E>(event: K, listener: EmitterListener<E, K>) {
    const listeners = this.#events.get(event);
    if (listeners) {
      listeners.add(listener);
    } else {
      this.#events.set(event, new Set([listener]));
    }
  }

  /**
   * 移除事件监听器，有三种使用方式：
   * 1. 移除特定事件的特定监听器
   * 2. 移除特定事件的所有监听器
   * 3. 移除所有事件的所有监听器
   * @param event - 要移除的事件名称（可选）
   * @param listener - 要移除的监听器函数（可选）
   * @example
   * // 移除特定事件的特定监听器
   * emitter.off('click', clickHandler);
   *
   * // 移除特定事件的所有监听器
   * emitter.off('click');
   *
   * // 移除所有事件的所有监听器
   * emitter.off();
   */
  off<K extends keyof E>(event?: K, listener?: EmitterListener<E, K>) {
    if (event && listener) {
      this.#offListener(event, listener);
    } else if (event) {
      this.#offEvent(event);
    } else {
      this.#offAll();
    }
  }

  #offAll() {
    this.#events.clear();
  }

  #offEvent<K extends keyof E>(event: K) {
    this.#events.delete(event);
  }

  #offListener<K extends keyof E>(event: K, listener: EmitterListener<E, K>) {
    const listeners = this.#events.get(event);

    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发指定事件，调用所有注册的监听器
   * @param event - 要触发的事件名称
   * @param args - 传递给监听器的参数
   * @remarks
   * 监听器会按照注册的顺序依次执行，如果某个监听器返回 false，
   * 则后续监听器将不会被执行
   * @example
   * emitter.emit('click', 10, 20);
   */
  emit<K extends keyof E>(event: K, ...args: Parameters<EmitterListener<E, K>>) {
    const listeners = this.#events.get(event) as Set<EmitterListener<E, K>> | undefined;

    if (!listeners) return;

    // 避免在 emit、on 的过程中改变 listeners 从而影响本次 emit
    for (const listener of [...listeners]) {
      if (listener(...args) === false) {
        break;
      }
    }
  }
}
