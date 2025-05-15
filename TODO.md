# utils-core
- [ ] dateStart/dateEnd 支持日期模式增加：周
- [ ] 数字（含小数）千分位
- [ ] vue + react hook 统一实现？
- [ ] date 时区转换
- [ ] 时间缩写，如 1d 表示 1天，1h 表示 1小时
- [ ] counter 计数器，支持从 cache 初始化读取和写入

# utils-browser
- [ ] browser cache 增加 indexedDB 支持
- [ ] 封装 indexedDB 为 storageAPI https://alova.js.org/zh-CN/tutorial/project/best-practice/manage-cache-by-indexeddb
- [ ] canvas 封装

# utils-vue
- [ ] useAsync -> useRequest
- [ ] useRequest + retryDelay: 指数级增加, maxDelay: 最大延迟, maxTimes: 最大重试次数 https://alova.js.org/zh-CN/tutorial/client/strategy/use-retriable-request、https://ahooks.js.org/zh-CN/hooks/use-request/retry
- [ ] useRequest + 轮询的支持 https://ahooks.js.org/zh-CN/hooks/use-request/polling
- [ ] useRequest + placeholder（初始化/占位数据）、isPlaceholder（是否是占位数据）
- [ ] useUpload/Download + downloading、uploading 支持，类型：total: number; loaded: number; https://alova.js.org/zh-CN/tutorial/client/strategy/use-uploader
- [ ] useRequest + preload、preloading、preloadSuccess、preloadError
- [ ] useRequest 内部异步竞态处理
- [ ] useRequest 防抖处理、节流处理 https://ahooks.js.org/zh-CN/hooks/use-request/debounce
- [ ] useRequest 自动请求 https://alova.js.org/zh-CN/tutorial/client/strategy/use-auto-request、https://ahooks.js.org/zh-CN/hooks/use-request/refresh-on-window-focus
- [ ] useRequest 委托请求 https://alova.js.org/zh-CN/tutorial/client/strategy/action-delegation-middleware
- [ ] useRequest SSE的支持 https://alova.js.org/zh-CN/tutorial/client/strategy/use-sse
- [ ] useRequest 跨组件更新（事件中心）
- [ ] 提取共享代码到 shared（工程内私有），但在打包的时候需要各自包含 shared 部分
- [ ] usePagination 参考 https://alova.js.org/zh-CN/tutorial/client/strategy/use-pagination
- [ ] useForm = {submit} https://alova.js.org/zh-CN/tutorial/client/strategy/use-form
- [ ] useCountDown {countingDown, }  https://alova.js.org/zh-CN/tutorial/client/strategy/use-captcha
- [ ] useAsync 支持 lazyLoading https://ahooks.js.org/zh-CN/hooks/use-request/loading-delay/
- [ ] useOnce 第一次变化后不再变更

# utils-react

# utils-node
- [ ] node cache 增加 fs 支持
