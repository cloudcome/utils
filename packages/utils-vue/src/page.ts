import type { MaybePromise } from '@cloudcome/utils-core/types';
import { onBeforeMount as onBeforeMountHook, onBeforeUnmount, onMounted as onMountedHook, onUnmounted } from 'vue';

export type HookListener = () => MaybePromise<unknown>;
export type HookListenerWithDispose = () => MaybePromise<undefined | HookListener>;

export function usePageMount(onBeforeMount: HookListenerWithDispose) {
  let un: HookListener | undefined;

  onBeforeMountHook(async () => {
    un = await onBeforeMount();
  });

  onBeforeUnmount(() => {
    un?.();
  });
}

export function usePageMounted(onMounted: HookListenerWithDispose) {
  let un: HookListener | undefined;

  onMountedHook(async () => {
    un = await onMounted();
  });

  onUnmounted(() => {
    un?.();
  });
}
