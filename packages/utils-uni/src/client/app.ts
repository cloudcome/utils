import type { HookListenerWithDispose } from '@cloudcome/utils-vue/component';
import { _runLifeHook } from '@cloudcome/utils-vue/shared';
import { onHide, onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { uniConfirm } from './message';

/**
 * 应用显示状态生命周期钩子函数
 *
 * 该函数用于监听应用从后台进入前台的生命周期事件。
 * 当应用从后台切换到前台时触发 onShow 回调，
 * 当应用从前台切换到后台时触发 onHide 回调。
 *
 * @param appShow - 应用显示状态变化时的回调函数，可以返回一个清理函数
 *
 * @example
 * // 基本用法
 * useAppShow(() => {
 *   console.log('应用进入前台');
 *
 *   // 可选：返回一个清理函数，在应用进入后台时执行
 *   return () => {
 *     console.log('应用进入后台');
 *   };
 * });
 *
 * @example
 * // 带有异步操作的用法
 * useAppShow(async () => {
 *   // 应用进入前台时刷新数据
 *   await refreshUserData();
 *
 *   // 返回清理函数
 *   return () => {
 *     // 应用进入后台时保存数据
 *     saveUserData();
 *   };
 * });
 */
export function useAppShow(appShow: HookListenerWithDispose) {
  _runLifeHook(onShow, onHide, appShow);
}

/**
 * 订阅模板消息
 * @param templateId 模板消息 ID 或 ID 列表
 * @returns Promise<boolean>
 */
export async function uniSubscribeNotice(templateId: string | string[]) {
  if (!uni.requestSubscribeMessage) return false;

  return new Promise<boolean>((resolve) => {
    const tmplIds = Array.isArray(templateId) ? templateId : [templateId];
    uni.requestSubscribeMessage({
      tmplIds,
      success(_res) {
        // 'accept'表示用户同意订阅该条id对应的模板消息，
        // 'reject'表示用户拒绝订阅该条id对应的模板消息，
        // 'ban'表示已被后台封禁，
        // 'filter'表示该模板因为模板标题同名被后台过滤
        const res = _res as unknown as Record<
          string,
          'accept' | 'reject' | 'ban' | 'filter'
        >;
        let subscribed = false;

        for (const templateId of tmplIds) {
          if (res[templateId] === 'accept') {
            subscribed = true;
            break;
          }
        }

        resolve(subscribed);
      },
      fail() {
        resolve(false);
      },
    });
  });
}

/**
 * 监听应用更新状态
 */
export function useAppUpdate() {
  const hasUpdate = ref(false);
  const updateReady = ref(false);
  const updateManager = uni.getUpdateManager?.();

  updateManager?.onCheckForUpdate((res) => {
    // 请求完新版本信息的回调
    hasUpdate.value = Boolean(res.hasUpdate);
  });

  updateManager?.onUpdateReady(async () => {
    updateReady.value = true;

    const confirm = await uniConfirm('新版本已经准备好，是否重启应用？', {
      title: '更新提示',
      confirmText: '重启',
    });
    if (!confirm) return;

    updateManager.applyUpdate();
  });

  updateManager?.onUpdateFailed(() => {
    // 新的版本下载失败
  });

  return { hasUpdate, updateReady };
}
