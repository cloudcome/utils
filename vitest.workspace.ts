import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./packages/browser-utils/vite.config.mts",
  "./packages/core-utils/vite.config.mts",
  "./packages/node-utils/vite.config.mts",
  "./packages/uni-utils/vite.config.mts",
  "./packages/react-hooks/vite.config.mts",
  "./packages/uni-hooks/vite.config.mts",
  "./packages/uni-utils/vite.config.mts",
  "./packages/vue-composables/vite.config.mts"
])
