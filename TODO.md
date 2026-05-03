# packages

# utils-core
- [ ] vue + react hook 统一实现？
- [ ] 提取共享代码到 shared（工程内私有），但在打包的时候需要各自包含 shared 部分
- [ ] counter 计数器，支持从 cache 初始化读取和写入

# utils-browser
- [ ] browser cache 增加 indexedDB 支持
- [ ] 封装 indexedDB 为 storageAPI https://alova.js.org/zh-CN/tutorial/project/best-practice/manage-cache-by-indexeddb https://axios-cache-interceptor.js.org/guide/storages#indexeddb

# utils-vue
- [ ] useRequest + retryDelay: 指数级增加, maxDelay: 最大延迟, maxTimes: 最大重试次数 https://alova.js.org/zh-CN/tutorial/client/strategy/use-retriable-request、https://ahooks.js.org/zh-CN/hooks/use-request/retry
- [ ] useRequest + 轮询的支持 https://ahooks.js.org/zh-CN/hooks/use-request/polling
- [ ] useUpload/Download + downloading、uploading 支持，类型：total: number; loaded: number; https://alova.js.org/zh-CN/tutorial/client/strategy/use-uploader
- [ ] useRequest + preload、preloading、preloadSuccess、preloadError
- [ ] useRequest 防抖处理、节流处理 https://ahooks.js.org/zh-CN/hooks/use-request/debounce
- [ ] useRequest 委托请求 https://alova.js.org/zh-CN/tutorial/client/strategy/action-delegation-middleware
- [ ] useRequest SSE的支持 https://alova.js.org/zh-CN/tutorial/client/strategy/use-sse
- [ ] useRequest 跨组件更新（事件中心）
- [ ] usePagination 参考 https://alova.js.org/zh-CN/tutorial/client/strategy/use-pagination
- [ ] useForm = {submit} https://alova.js.org/zh-CN/tutorial/client/strategy/use-form
- [ ] useCountDown {countingDown, }  https://alova.js.org/zh-CN/tutorial/client/strategy/use-captcha
- [ ] useAsync 支持 lazyLoading https://ahooks.js.org/zh-CN/hooks/use-request/loading-delay/
- [ ] useOnce 第一次变化后不再变更

# utils-react

# utils-node
- [ ] node cache 增加 fs 支持
- [ ] 人性化的 fs
