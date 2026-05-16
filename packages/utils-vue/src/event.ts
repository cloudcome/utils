import { Emitter, type EmitterListener, type EmitterMap } from '@cloudcome/utils-core/emitter';
import { onBeforeMount, onBeforeUnmount, onMounted, onUnmounted } from 'vue';

export type EventEmitter = {
  on: (event: string, listener: (...payloads: unknown[]) => unknown) => unknown;
  off: (event: string, listener: (...payloads: unknown[]) => unknown) => unknown;
  emit: (event: string, ...payloads: unknown[]) => unknown;
};

export type CreateEventCenterOptions = {
  emitter?: EventEmitter;
  stage?: 'mount' | 'mounted';
};

export function createEventHook<E extends EmitterMap>(options: CreateEventCenterOptions = {}) {
  const emitter = options.emitter || new Emitter();

  const on = <K extends keyof E>(event: K, listener: EmitterListener<E, K>) => {
    // @ts-expect-error
    emitter.on(event as string, listener);
  };

  const off = <K extends keyof E>(event: K, listener: EmitterListener<E, K>) => {
    // @ts-expect-error
    emitter.off(event as string, listener);
  };

  const emit = <K extends keyof E>(event: K, ...payloads: E[K]) => {
    emitter.emit(event as string, ...payloads);
  };

  const useEvent = <K extends keyof E>(event: K, fn: (...payloads: E[K]) => unknown) => {
    if (options.stage === 'mounted') {
      onMounted(() => {
        on(event, fn);
      });
      onUnmounted(() => {
        off(event, fn);
      });
    } else {
      onBeforeMount(() => {
        on(event, fn);
      });
      onBeforeUnmount(() => {
        off(event, fn);
      });
    }
  };

  return { on, off, emit, useEvent };
}
