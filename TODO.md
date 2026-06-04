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
- [ ] useCountDown {countingDown, } https://alova.js.org/zh-CN/tutorial/client/strategy/use-captcha
- [ ] useAsync 支持 lazyLoading https://ahooks.js.org/zh-CN/hooks/use-request/loading-delay/
- [ ] useOnce 第一次变化后不再变更

# utils-react

# utils-node

- [ ] node cache 增加 fs 支持
- [ ] 人性化的 fs

# utils-uni

- [ ] database: Db 类暴露 aggregate 聚合管道方法
  - 背景：uniCloud 底层支持 `db.collection().aggregate()`，但 `dbProxy` 封装的 `Db` 类未暴露该方法（内部已有 `_createAggregate()` 私有方法）
  - 需求来源：miao-api 的 `aggregateDistribution` 定时统计任务，当前使用 `dbEach` 流式遍历全表后在应用层累积 Map 做分组统计，数据量增长后内存和性能压力增大
  - 期望 API 示例：
    ```typescript
    const result = await catCheckinsTable
      .aggregate()
      .match({ date })
      .group({ _id: '$consecutiveDays', count: { $sum: 1 } })
      .end();
    ```
  - 典型场景：按字段分组计数（group + $sum）、按字段分组求和、多阶段管道（match → group → project）
  - 注意事项：需保持与 `dbProxy` 一致的错误处理（parseError）和事务兼容性
