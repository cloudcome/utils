import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './packages/utils-browser/vite.config.mts',
  './packages/utils-core/vite.config.mts',
  './packages/utils-node/vite.config.mts',
  './packages/utils-uni/vite.config.mts',
  './packages/utils-react/vite.config.mts',
  './packages/utils-vue/vite.config.mts',
]);
