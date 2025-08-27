# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 1.0.0 (2025-08-27)


### Bug Fixes

* **utils-core:** 修复 asyncShared 函数的错误处理和类型定义问题 ([27264d2](https://github.com/cloudcome/utils/packages/utils-core/commit/27264d2b8dc154ca83f0c2becd95ef44c12ec1a6))
* **utils-core:** 修复 pathRelativize 函数对相对路径的处理 ([f632c9b](https://github.com/cloudcome/utils/packages/utils-core/commit/f632c9b56e22914958ded53238caf2db9e2c73a8))
* **utils-core:** 修复 qsParse 函数查询字符串解析问题 ([ce273f9](https://github.com/cloudcome/utils/packages/utils-core/commit/ce273f9a252a506402858bfa3ab72185fae805d4))
* **utils-core:** 修正 numberAbbr 函数的计算逻辑 ([b8483c7](https://github.com/cloudcome/utils/packages/utils-core/commit/b8483c73218894f3b1eec939f59377f2d9049422))


### Features

* **array:** 添加数组差异对比功能 ([35acf91](https://github.com/cloudcome/utils/packages/utils-core/commit/35acf916a10fa1395633faccac67b7f70e575f2b))
* **array:** 添加数组差异比较功能 ([4dc5fa7](https://github.com/cloudcome/utils/packages/utils-core/commit/4dc5fa7a9d5c9e264a2ebb5144bcd9a08656cbed))
* **async:** 为 asyncShared 函数添加回调事件支持 ([af6737f](https://github.com/cloudcome/utils/packages/utils-core/commit/af6737fbf0e59f694f229fd566fb0e30f9d9c9b1))
* **async:** 添加 asyncShared 函数实现异步函数结果共享 ([5883200](https://github.com/cloudcome/utils/packages/utils-core/commit/588320034e07fec03f0bdd16a521d9a3c65013fb))
* **cache:** 为缓存添加清除功能并优化测试用例 ([653805e](https://github.com/cloudcome/utils/packages/utils-core/commit/653805e79965c0c27202b282ac46f486444900fc))
* **core:** 添加枚举定义和工厂函数 ([6a56ab8](https://github.com/cloudcome/utils/packages/utils-core/commit/6a56ab874412bad5cf18234d59778756b53c7903))
* **date:** 优化时区转换逻辑并添加新功能 ([1852c73](https://github.com/cloudcome/utils/packages/utils-core/commit/1852c731f80e6c2a4ff524e9638349bbc1235c9e))
* **date:** 增加时区相关功能并优化日期解析 ([993ccfe](https://github.com/cloudcome/utils/packages/utils-core/commit/993ccfe67fb2979ee9ca6c5c998af6ceca4cf9cd))
* **number:** 增强 numberFixed 函数功能并优化相关测试 ([c94a9ff](https://github.com/cloudcome/utils/packages/utils-core/commit/c94a9ff97bc2b95a98356d66f6e1d211e0333cf9))
* **number:** 添加数字格式化功能并优化相关测试 ([1b23e94](https://github.com/cloudcome/utils/packages/utils-core/commit/1b23e94f28772168481cff36ce8287a7986da90f))
* **path:** 添加路径相对化处理函数 ([aaac0a0](https://github.com/cloudcome/utils/packages/utils-core/commit/aaac0a0b765b4c6cebd7eaa6c6c676fa46b9eb61))
* **time:** 增强时间转换功能并添加新方法 ([dfaf38f](https://github.com/cloudcome/utils/packages/utils-core/commit/dfaf38f9c41daa58754ec391f5070e016189e2cc))
* **time:** 添加时间字符串转换函数并重命名时间处理函数 ([4a08954](https://github.com/cloudcome/utils/packages/utils-core/commit/4a08954b278874a0d7c84167da0a727f18548d60))
* **time:** 添加时间格式化相关工具函数 ([2efb2d6](https://github.com/cloudcome/utils/packages/utils-core/commit/2efb2d6a92b5df0efd6be197d511aefe5e4cd553))
* **types:** 添加 DeepPartial 类型 ([2d551c5](https://github.com/cloudcome/utils/packages/utils-core/commit/2d551c5745310ea37f8bd6fe169918d99e3fde12))
* **tz:** 重构 TZDate 类并添加时区转换功能 ([434e985](https://github.com/cloudcome/utils/packages/utils-core/commit/434e985141aa2fbd34c9da1048bb21cd50f9268e))
* **unique:** 增加生成唯一字符串功能 ([287f384](https://github.com/cloudcome/utils/packages/utils-core/commit/287f384406ea710885b1a68da66ef3dfdddae7f2))
* **utils-core:** 为 TzDate 类添加 getTimezoneOrder 方法 ([23bbaac](https://github.com/cloudcome/utils/packages/utils-core/commit/23bbaac597222dad99830048712b6c50b9db4f29))
* **utils-core:** 优化 arrayDiff 函数返回值结构 ([0fc18c0](https://github.com/cloudcome/utils/packages/utils-core/commit/0fc18c0ef72145f348de7085c69b09d73d75b58c))
* **utils-core:** 优化数字工具函数并添加文件大小缩写功能 ([082e070](https://github.com/cloudcome/utils/packages/utils-core/commit/082e070216bcd74c12d9a2667d6829355c07dcb1))
* **utils-core:** 实现时区相关工具类 TZDate ([22ec027](https://github.com/cloudcome/utils/packages/utils-core/commit/22ec02770966cf3f6a4758da711d8489fdbcfb20))
* **utils-core:** 新增 base64、error、time 和 unique模块 ([ce90232](https://github.com/cloudcome/utils/packages/utils-core/commit/ce90232ba0dac56346384b8d6f1f608ee3a3b4b7))
* **utils-core:** 新增错误处理相关工具函数 ([3a9b64a](https://github.com/cloudcome/utils/packages/utils-core/commit/3a9b64a304c9c055fe60eaf4a97449487110bc9b))
* **utils-core:** 添加 base64 转换为 Blob 的函数 ([f046578](https://github.com/cloudcome/utils/packages/utils-core/commit/f0465780b6ce7941449a209188a0a8a9b119ceb8))
* **utils-core:** 添加 createMinDelayPromise 函数并编写相关测试 ([a436462](https://github.com/cloudcome/utils/packages/utils-core/commit/a43646286949a35e51db56e647e2a44c9a1a3b84))
* **utils-core:** 添加 enum 模块并更新相关配置 ([15b5971](https://github.com/cloudcome/utils/packages/utils-core/commit/15b597149184802a87622d247356e9a5d6731de5))
* **utils-core:** 添加 stringify 函数并优化类型检查 ([4298f04](https://github.com/cloudcome/utils/packages/utils-core/commit/4298f04665ff0eae9265305334f2d1c2ed38e59b))
* **utils-core:** 添加 uniqueBigInt函数并实现相关测试 ([ae37704](https://github.com/cloudcome/utils/packages/utils-core/commit/ae377042199b75dd9e971d7231767209b1607352))
* **utils-core:** 添加数组移动函数并优化数组操作 ([461165b](https://github.com/cloudcome/utils/packages/utils-core/commit/461165b0f7d12395408f3ea92cf5a1d5a4591c19))
* **utils-core:** 添加自定义异常构建函数 ([1b46a3b](https://github.com/cloudcome/utils/packages/utils-core/commit/1b46a3b0ec3300c69c954049f03c4acd0f75c09d))
* **utils-core:** 重构 AsyncQueue 类 ([8fc8b7b](https://github.com/cloudcome/utils/packages/utils-core/commit/8fc8b7b7771ca53bad96409ff2a8a714f918b4d5))
* **utils-core:** 重构 qsParse 和 qsStringify 函数 ([9335a3d](https://github.com/cloudcome/utils/packages/utils-core/commit/9335a3dfa0b5ba501b520b46f2d087fb77114319))
