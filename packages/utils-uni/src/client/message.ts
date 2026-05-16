import { promiseDelay } from '@cloudcome/utils-core/promise';
import { isString } from '@cloudcome/utils-core/type';

/**
 * 显示 confirm 提示
 * @param text 提示文本
 * @param options 其他选项
 * @returns 提示完成后的 Promise
 */
export function uniConfirm(
  text: string,
  options?: Omit<UniNamespace.ShowModalOptions, 'showCancel' | 'success' | 'content' | 'editable'>,
) {
  const cancelText = options?.cancelText || '取消';
  const confirmText = options?.confirmText || '确认';

  if (cancelText.length > 4) console.warn('微信小程序内不支持 cancelText 长度超过 4 个字符');
  if (confirmText.length > 4) console.warn('微信小程序内不支持 confirmText 长度超过 4 个字符');

  return new Promise<boolean>((resolve) => {
    // 避免和 hideLoading 同时出现影响弹窗
    setTimeout(() => {
      uni.showModal({
        title: '请确认',
        content: text,
        showCancel: true,
        confirmText,
        cancelText,
        ...options,
        success(result) {
          resolve(result.confirm);
        },
      });
    });
  });
}

/**
 * 显示 prompt 提示
 * @param text 提示文本
 * @param options 其他选项
 * @returns 提示完成后的 Promise
 */
export function uniPrompt(
  text: string,
  options?: Omit<UniNamespace.ShowModalOptions, 'showCancel' | 'success' | 'content' | 'editable'>,
) {
  const cancelText = options?.cancelText || '取消';
  const confirmText = options?.confirmText || '确认';

  if (cancelText.length > 4) console.warn('微信小程序内不支持 cancelText 长度超过 4 个字符');
  if (confirmText.length > 4) console.warn('微信小程序内不支持 confirmText 长度超过 4 个字符');

  return new Promise<string>((resolve) => {
    // 避免和 hideLoading 同时出现影响弹窗
    setTimeout(() => {
      uni.showModal({
        title: '请输入',
        content: '',
        placeholderText: text,
        showCancel: true,
        confirmText,
        cancelText,
        editable: true,
        ...options,
        success(result) {
          resolve(result.content || '');
        },
      });
    });
  });
}

/**
 * 显示 alert 提示
 * @param text 提示文本
 * @param options 其他选项
 * @returns 提示完成后的 Promise
 */
export function uniAlert(
  text: string,
  options?: Omit<UniNamespace.ShowModalOptions, 'cancelText' | 'showCancel' | 'success' | 'content'>,
) {
  const confirmText = options?.confirmText || '好';

  if (confirmText.length > 4) console.warn('微信小程序内不支持 confirmText 长度超过 4 个字符');

  return new Promise<void>((resolve) => {
    // 避免和 hideLoading 同时出现影响弹窗
    setTimeout(() => {
      uni.showModal({
        title: '提示',
        confirmText,
        cancelText: '',
        ...options,
        content: text,
        showCancel: false,
        success() {
          resolve();
        },
      });
    });
  });
}

/**
 * 显示 toast 提示
 * @param text 提示文本
 * @param icon 图标
 * @param options 其他选项
 * @returns 提示完成后的 Promise
 */
export function uniToast(text: string, icon?: UniNamespace.ShowToastOptions['icon']): Promise<void>;
export function uniToast(text: string, options?: UniNamespace.ShowToastOptions): Promise<void>;
export function uniToast(
  text: string,
  iconOrOptions?: UniNamespace.ShowToastOptions['icon'] | UniNamespace.ShowToastOptions,
): Promise<void> {
  const options = {} as UniNamespace.ShowToastOptions;

  if (isString(iconOrOptions)) {
    options.icon = iconOrOptions;
  } else {
    Object.assign(options, iconOrOptions);
  }

  return new Promise<void>((resolve) => {
    // 避免和 hideLoading 同时出现影响弹窗
    setTimeout(async () => {
      uni.showToast({
        title: text,
        duration: 2900,
        icon: options.icon || 'none',
      });
      promiseDelay(3000).then(resolve);
    });
  });
}

/**
 * 显示 loading 提示
 * @param title 提示文本
 */
export function uniLoading(title?: string) {
  uni.showLoading({
    title,
    mask: true,
  });
}
