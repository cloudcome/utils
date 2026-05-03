import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@cloudcome/utils',
  description: '跨平台、多框架的 TypeScript 工具函数库',
  srcDir: 'src',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      {
        text: '包',
        items: [
          { text: 'utils-core', link: '/utils-core/' },
          { text: 'utils-browser', link: '/utils-browser/' },
          { text: 'utils-node', link: '/utils-node/' },
          { text: 'utils-vue', link: '/utils-vue/' },
          { text: 'utils-react', link: '/utils-react/' },
          { text: 'utils-uni', link: '/utils-uni/' },
        ],
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
          ],
        },
      ],
      '/utils-core/': [
        {
          text: '@cloudcome/utils-core',
          items: [
            { text: '概览', link: '/utils-core/' },
            { text: 'array', link: '/utils-core/array' },
            { text: 'base64', link: '/utils-core/base64' },
            { text: 'cache', link: '/utils-core/cache' },
            { text: 'color', link: '/utils-core/color' },
            { text: 'crypto', link: '/utils-core/crypto' },
            { text: 'date', link: '/utils-core/date' },
            { text: 'dict', link: '/utils-core/dict' },
            { text: 'emitter', link: '/utils-core/emitter' },
            { text: 'env', link: '/utils-core/env' },
            { text: 'error', link: '/utils-core/error' },
            { text: 'exception', link: '/utils-core/exception' },
            { text: 'function', link: '/utils-core/function' },
            { text: 'number', link: '/utils-core/number' },
            { text: 'object', link: '/utils-core/object' },
            { text: 'path', link: '/utils-core/path' },
            { text: 'promise', link: '/utils-core/promise' },
            { text: 'qs', link: '/utils-core/qs' },
            { text: 'regexp', link: '/utils-core/regexp' },
            { text: 'string', link: '/utils-core/string' },
            { text: 'time', link: '/utils-core/time' },
            { text: 'tree', link: '/utils-core/tree' },
            { text: 'try', link: '/utils-core/try' },
            { text: 'type', link: '/utils-core/type' },
            { text: 'types', link: '/utils-core/types' },
            { text: 'unique', link: '/utils-core/unique' },
            { text: 'url', link: '/utils-core/url' },
            { text: 'version', link: '/utils-core/version' },
          ],
        },
      ],
      '/utils-browser/': [
        {
          text: '@cloudcome/utils-browser',
          items: [
            { text: '概览', link: '/utils-browser/' },
            { text: 'base64', link: '/utils-browser/base64' },
            { text: 'cache', link: '/utils-browser/cache' },
            { text: 'canvas', link: '/utils-browser/canvas' },
            { text: 'clipboard', link: '/utils-browser/clipboard' },
            { text: 'cookie', link: '/utils-browser/cookie' },
            { text: 'dom', link: '/utils-browser/dom' },
            { text: 'download', link: '/utils-browser/download' },
            { text: 'image', link: '/utils-browser/image' },
            { text: 'timer', link: '/utils-browser/timer' },
            { text: 'video', link: '/utils-browser/video' },
          ],
        },
      ],
      '/utils-node/': [
        {
          text: '@cloudcome/utils-node',
          items: [
            { text: '概览', link: '/utils-node/' },
            { text: 'base64', link: '/utils-node/base64' },
            { text: 'crypto', link: '/utils-node/crypto' },
            { text: 'jsonl', link: '/utils-node/jsonl' },
          ],
        },
      ],
      '/utils-vue/': [
        {
          text: '@cloudcome/utils-vue',
          items: [
            { text: '概览', link: '/utils-vue/' },
            { text: 'async', link: '/utils-vue/async' },
            { text: 'component', link: '/utils-vue/component' },
            { text: 'event', link: '/utils-vue/event' },
            { text: 'request', link: '/utils-vue/request' },
            { text: 'shared', link: '/utils-vue/shared' },
            { text: 'state', link: '/utils-vue/state' },
            { text: 'time', link: '/utils-vue/time' },
            { text: 'types', link: '/utils-vue/types' },
          ],
        },
      ],
      '/utils-react/': [
        {
          text: '@cloudcome/utils-react',
          items: [
            { text: '概览', link: '/utils-react/' },
          ],
        },
      ],
      '/utils-uni/': [
        {
          text: '@cloudcome/utils-uni',
          items: [
            { text: '概览', link: '/utils-uni/' },
            { text: 'app', link: '/utils-uni/app' },
            { text: 'client', link: '/utils-uni/client' },
            { text: 'cloud', link: '/utils-uni/cloud' },
            { text: 'database', link: '/utils-uni/database' },
            { text: 'page', link: '/utils-uni/page' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/cloudcome/utils' },
    ],
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024-present ydr.me',
    },
    search: {
      provider: 'local',
    },
  },
})
