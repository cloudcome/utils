import type { AnyArray, AnyFunction } from '@cloudcome/utils-core/types';
import { type UseRequestOptions, type UseRequestOutput, useRequest } from '@cloudcome/utils-vue/request';
import type { CloudMethodOutput, UniError } from '@/cloud';
import type { ClientDatabaseOutput } from '@/database';
import { parseCloudMethodOutput } from '../_helpers';
import { uniLoading, uniToast } from './message';
import { isFunction } from '@cloudcome/utils-core/type';

export type CreateUseCloudObjectOptions = {
  /**
   * 模拟云对象，用于单元测试
   * @private
   */
  // biome-ignore lint/suspicious/noExplicitAny: 单测使用 any
  _mockServer?: any;

  /**
   * 回退错误信息
   * @default '请求失败'
   */
  fallbackErrorMessage?: string;

  /**
   * 请求开始前的回调函数
   */
  onBefore?: () => unknown;

  /**
   * 请求成功后的回调函数
   */
  onSuccess?: () => unknown;

  /**
   * 请求失败时的回调函数
   * @param err 错误信息
   */
  onError?: (err: UniError) => unknown;

  /**
   * 请求完成后的回调函数（无论成功或失败都会执行）
   */
  onAfter?: () => unknown;

  /**
   * 显示加载状态的回调函数，当配置了 showLoading 为 true 时会调用
   */
  onShowLoading?: () => unknown;

  /**
   * 隐藏加载状态的回调函数，当配置了 showLoading 为 true 时会调用
   */
  onHideLoading?: () => unknown;

  /**
   * 显示错误信息的回调函数，当配置了 showError 为 true 时会调用
   * @param err 错误信息
   */
  onShowError?: (err: UniError) => unknown;
};

/**
 * 云对象请求函数类型定义
 * @template F 云对象方法函数类型
 * @param input 云对象方法的参数数组
 * @returns 返回云对象方法执行结果的Promise
 */
export type CloudObjectRequest = <F extends AnyFunction>(
  ...input: Parameters<F>
) => Promise<CloudMethodOutput<ReturnType<F>>>;

/**
 * 用于调用云对象方法的配置选项类型定义
 * @template I 输入参数类型数组
 * @template O 输出结果类型
 */
export type UseCloudMethodOptions<I extends AnyArray, O> = Omit<UseRequestOptions<I, O>, 'onError'> & {
  /**
   * 请求发生错误时的回调函数
   * @param err 错误信息
   * @param inputs 请求输入参数
   */
  onError?: (err: UniError, ...inputs: I) => unknown;

  /**
   * 是否显示加载状态
   * @default false
   * @description 支持布尔值或函数类型。当为函数时，接收请求参数并返回布尔值决定是否显示 loading。
   * @example
   * // 布尔值
   * showLoading: true
   * // 函数：根据参数决定是否显示
   * showLoading: (userId) => userId !== 'anonymous'
   */
  showLoading?: boolean | ((...inputs: I) => boolean);

  /**
   * 是否显示错误信息
   * @default false
   * @description 支持布尔值或函数类型。当为函数时，接收请求参数并返回布尔值决定是否显示错误提示。
   * @example
   * // 布尔值
   * showError: true
   * // 函数：根据错误码决定是否显示
   * showError: (err) => err.errCode !== 404
   */
  showError?: boolean | ((err: UniError, ...inputs: I) => boolean);
};

/**
 * 用于调用云对象方法的hook函数类型定义
 * @template I 输入参数类型数组
 * @template O 输出结果类型
 */
export type UseCloudMethod<Api extends Record<string, AnyFunction>> = {
  <K extends keyof Api, I extends AnyArray, O>(
    method: K,
    caller: (request: Api[K], ...inputs: I) => Promise<CloudMethodOutput<O>>,
    options?: UseCloudMethodOptions<I, O>,
  ): UseRequestOutput<I, O>;
};

/**
 * 导入云对象并创建一个用于调用云对象的hook
 * @param objectName 云对象名称
 * @param importOptions 配置选项，包含模拟服务器、回退错误信息等
 * @returns 返回一个可用于调用云对象方法的hook函数
 */
export function importCloudObject<Api extends Record<string, AnyFunction>>(
  objectName: string,
  importOptions?: CreateUseCloudObjectOptions,
) {
  const fallbackErrorMessage = importOptions?.fallbackErrorMessage || '请求失败';
  const server =
    importOptions?._mockServer ||
    uniCloud.importObject(objectName, {
      customUI: true,
    });
  const onShowLoading = importOptions?.onShowLoading || (() => uniLoading());
  const onHideLoading = importOptions?.onHideLoading || (() => uni.hideLoading());
  const onShowError = importOptions?.onShowError || ((err) => uniToast(err.message));

  /**
   * 用于调用云对象方法的hook函数
   * @template I 输入参数类型
   * @template O 输出结果类型
   * @param method 云对象方法名
   * @param caller 调用云对象的函数
   * @param options 配置选项，包含请求相关的配置
   * @returns 返回一个请求hook，用于处理云对象调用
   */
  const useCloudMethod: UseCloudMethod<Api> = (method, caller, options) => {
    // 使用请求hook处理云对象调用
    return useRequest(
      async (...inputs) => {
        const request = server[method];
        const output = await caller(request, ...inputs);
        return parseCloudMethodOutput(output, fallbackErrorMessage);
      },
      {
        ...options,
        async onBefore(...inputs) {
          const shouldShowLoading = isFunction(options?.showLoading)
            ? options.showLoading(...inputs)
            : options?.showLoading;
          if (shouldShowLoading) onShowLoading();

          await importOptions?.onBefore?.();
          await options?.onBefore?.(...inputs);
        },
        async onSuccess(data, ...inputs) {
          await options?.onSuccess?.(data, ...inputs);
          await importOptions?.onSuccess?.();
        },
        async onError(err, ...inputs) {
          await options?.onError?.(err as UniError, ...inputs);
          await importOptions?.onError?.(err as UniError);

          const shouldShowError = isFunction(options?.showError)
            ? options.showError(err as UniError, ...inputs)
            : options?.showError;
          if (shouldShowError) {
            // 加延迟是尽量保证在 loading 隐藏后再显示错误信息
            setTimeout(() => {
              onShowError(err as UniError);
            });
          }
        },
        async onAfter(...inputs) {
          if (options?.showLoading) onHideLoading();

          await importOptions?.onAfter?.();
          await options?.onAfter?.(...inputs);
        },
      },
    );
  };

  return useCloudMethod;
}

export type UseDatabaseOptions<I extends AnyArray, O> = UseRequestOptions<I, O> & {
  /**
   * 模拟数据库，用于单元测试
   */
  // biome-ignore lint/suspicious/noExplicitAny: 单测使用 any
  _mockDatabase?: any;
};

/**
 * 创建一个用于调用云数据库的hook
 * @param caller 调用云数据库的函数，接收数据库实例和输入参数，返回Promise
 * @param options 配置选项
 * @returns 返回一个请求hook，用于处理云数据库调用
 */
export function useDatabase<I extends AnyArray, O>(
  caller: (db: UniCloud.Database, ...inputs: I) => Promise<ClientDatabaseOutput<O>>,
  options?: UseDatabaseOptions<I, O>,
): UseRequestOutput<I, O>;
export function useDatabase<I extends AnyArray, O>(
  caller: (db: UniCloud.Database, ...inputs: I) => Promise<ClientDatabaseOutput<O>>,
  options?: UseDatabaseOptions<I, O>,
): UseRequestOutput<I, O> {
  // 获取数据库实例，优先使用模拟数据库（用于测试），否则使用uniCloud数据库
  const db = options?._mockDatabase || uniCloud.database();
  return useRequest(async (...inputs: I) => {
    const { result } = await caller(db, ...inputs);
    if (!result.errCode) return result;
    throw new Error(result.errMsg || '请求失败');
  }, options);
}
