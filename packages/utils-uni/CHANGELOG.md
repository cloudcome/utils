# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.13.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.12.0...@cloudcome/utils-uni@1.13.0) (2025-09-20)

### Features

* **cloud:** 重命名云对象暴露相关类型和函数 ([f5857dc](https://github.com/cloudcome/utils/commit/f5857dc780ec59dc940aeebeb24a3bf98ae92d2f))
* **cloud:** 重命名云对象相关类型和导入路径 ([a45b6be](https://github.com/cloudcome/utils/commit/a45b6be2ea088be5e90589fa57c97ca2cf72fb05))
* **cloud:** 重构云对象方法相关类型和函数命名 ([e74b24f](https://github.com/cloudcome/utils/commit/e74b24f8f0e515ce8ec99030aa67e0f3af00ebef))
* **utils-uni:** 导出数据库命令模块并优化导入方式 ([7baff78](https://github.com/cloudcome/utils/commit/7baff78a2f62bebaaac6bae7fd01ffb57ca37463))
* **utils-uni:** 新增 dbUnique 函数 ([2a3f2f9](https://github.com/cloudcome/utils/commit/2a3f2f939e83f490672b8e273d303fe94f2b8544))
* **utils-uni:** 新增数据库执行结果解析函数并优化模块结构 ([acd1295](https://github.com/cloudcome/utils/commit/acd1295eaae79b9d12b29c38c32f7f6150384ce0))
* **utils-uni:** 重命名云函数输出解析工具函数 ([3537684](https://github.com/cloudcome/utils/commit/35376842e9e836165b7ec54f0a01aea2f9e49706))
* **utils-uni:** 重命名云对象输出解析函数及类型 ([923cd2a](https://github.com/cloudcome/utils/commit/923cd2a6bf36ae427a921d8ab07c8d600a966b79))
* **utils-uni:** 重命名数据库相关类型和接口 ([62eeac3](https://github.com/cloudcome/utils/commit/62eeac318c82997337b8348e71ecc1886a2836ae))

# [1.12.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.11.0...@cloudcome/utils-uni@1.12.0) (2025-09-19)

### Features

* **utils-uni:** 优化数据库字段选择类型逻辑 ([b54ce82](https://github.com/cloudcome/utils/commit/b54ce8238bcd7efee997c4369d54103a433ac85a))
* **utils-uni:** 增强数据库查询字段校验功能 ([10e26d0](https://github.com/cloudcome/utils/commit/10e26d0376b4f82b14e70c24e14abc5ee1368bca))
* **utils-uni:** 增强数据库查询字段类型校验 ([99432cd](https://github.com/cloudcome/utils/commit/99432cde074e257288ebf95a16c82a793ca58591))
* **utils-uni:** 增强数据库类型定义支持查询与更新命令 ([267dc5a](https://github.com/cloudcome/utils/commit/267dc5ae17e97d2ce1fda7fb9645a958365fa269))

# [1.11.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.10.0...@cloudcome/utils-uni@1.11.0) (2025-09-19)

### Bug Fixes

* **utils-uni:** 修正 ExtractUniCloudObjectExpose 类型定义 ([2292a6b](https://github.com/cloudcome/utils/commit/2292a6b83224e51ddfa091ecdaf6487a91eeed79))

### Features

* **cloud:** 重命名云对象类型并增强类型定义 ([dab47de](https://github.com/cloudcome/utils/commit/dab47dea5c07b1d2c23589aa66e25d07aaf60c13))

# [1.10.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.9.0...@cloudcome/utils-uni@1.10.0) (2025-09-18)

### Features

* **utils-uni:** 增加仅允许本地环境运行的云函数功能 ([5da62ec](https://github.com/cloudcome/utils/commit/5da62ecd8a10ea12cb37b2aeb7e4813b672f4fbd))
* **utils-uni:** 导出 parseCloudObjectOutput 函数 ([3b083ac](https://github.com/cloudcome/utils/commit/3b083ac3ba5204cc9ae633e6fa0489c6fa94f1dd))
* **utils-uni:** 将 UniIdCloudObject 重命名为 UniIdCommonModule ([e2039fc](https://github.com/cloudcome/utils/commit/e2039fc8703508b961b9f4b9055c7454f8abc7ca))
* **utils-uni:** 新增 parseCloudModuleOutput 函数用于解析云函数模块输出结果 ([d11ce37](https://github.com/cloudcome/utils/commit/d11ce378883a8d4797b4b5f8cbf0cd3503e8220e))

# [1.9.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.8.0...@cloudcome/utils-uni@1.9.0) (2025-09-18)

### Features

* **database:** 更新数据库操作命令类型定义及函数参数名称 ([ed0d256](https://github.com/cloudcome/utils/commit/ed0d256dd3041a826f33d8c2f88cf308d7c3987b))
* **database:** 更新数据库查询处理逻辑 ([38b7205](https://github.com/cloudcome/utils/commit/38b72052092389028302846ee6f775322e4c4b3e))
* **utils-uni:** 调整云函数返回格式并优化响应处理 ([6917dc3](https://github.com/cloudcome/utils/commit/6917dc3c55afd58ab8cfec4d7d697aa97126b17c))

# [1.8.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.7.1...@cloudcome/utils-uni@1.8.0) (2025-09-17)

### Bug Fixes

* **database:** 修复 aggregate 查询中 $unwind 阶段的路径表达式 ([7201cac](https://github.com/cloudcome/utils/commit/7201cac1f47296fb40339baa7145fa442f38dc6d))
* **database:** 修复 where 查询逻辑 ([f7a36f7](https://github.com/cloudcome/utils/commit/f7a36f7958b1a348e8c908fba1d841f6bff939e6))

### Features

* **database:** 优化 dbUpsert 函数的 onAfterUpdate 回调 ([b4f70ae](https://github.com/cloudcome/utils/commit/b4f70ae9ceaaf28fb64feaae2b8aa13d50e6a012))
* **database:** 增加对重复使用数据表实例的错误处理 ([d91152a](https://github.com/cloudcome/utils/commit/d91152a32fbdcdaab45e67afb8b4ba4cb1f94816))
* **database:** 增强 upsert 函数功能 ([e7ed3e7](https://github.com/cloudcome/utils/commit/e7ed3e7cf2f3c4178e300f5054f125366e4b9268))
* **database:** 支持数据库关联查询 ([9c7bfe8](https://github.com/cloudcome/utils/commit/9c7bfe8a8f8015d72d84d11cfe4690348ecbbc59))

## [1.7.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.7.0...@cloudcome/utils-uni@1.7.1) (2025-09-15)

### Bug Fixes

* **utils-uni:** 修复 db.where 方法对 _id 传参值类型的判断 ([9483f44](https://github.com/cloudcome/utils/commit/9483f4434e65807dc1efd038c507c5406669d78f))

# [1.7.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.6.0...@cloudcome/utils-uni@1.7.0) (2025-09-15)

### Features

* **database:** 重构 table 方法并优化 API 设计 ([6a88d0f](https://github.com/cloudcome/utils/commit/6a88d0f2223e1e55a2d0ba9ef9c06b8736566ece))

# [1.6.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.5.1...@cloudcome/utils-uni@1.6.0) (2025-09-14)

### Features

* **database:** 重构数据库方法返回值 ([43561d3](https://github.com/cloudcome/utils/commit/43561d3fd8412f542962308d4c0d42365524bb4e))
* **utils-uni:** 重构数据库操作类 Db，更完善的支持类型系统 ([085c6fb](https://github.com/cloudcome/utils/commit/085c6fba9f46c8f95589f2001e6d7a9ed8b90c0e))

## [1.5.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.5.0...@cloudcome/utils-uni@1.5.1) (2025-09-14)

**Note:** Version bump only for package @cloudcome/utils-uni

# [1.5.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.4.0...@cloudcome/utils-uni@1.5.0) (2025-09-14)

### Features

* **database:** 添加数据库事务功能 ([4f990e9](https://github.com/cloudcome/utils/commit/4f990e92ee3392e6016c2cb018b87c5f159178c5))
* **database:** 重构数据库操作并添加新功能 ([6ab7a86](https://github.com/cloudcome/utils/commit/6ab7a86c8ad406d42b99f4881b4e5dda5cf76468))

# [1.4.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.3.1...@cloudcome/utils-uni@1.4.0) (2025-09-13)

### Bug Fixes

* **utils-uni:** 修复错误消息处理逻辑 ([7006f9e](https://github.com/cloudcome/utils/commit/7006f9e9abb7ceaff75e9139ce7cb49bd379bf5e))

### Features

* **database:** 新增数据库操作模块 ([ce0ac49](https://github.com/cloudcome/utils/commit/ce0ac49ae3f84e7c9e2763e8426392888a59c724))
* **utils-uni:** 为 createUseCloudObject 添加错误信息回退功能 ([2bd8392](https://github.com/cloudcome/utils/commit/2bd83929e31f3ffc586911266a461f19a2fb788a))
* **utils-uni:** 在 UniCloudObjectOutput 类型中添加 requestId 字段 ([55662bb](https://github.com/cloudcome/utils/commit/55662bb9a5dd40ff9c2d27b447b89b70feb3cda1))
* **utils-uni:** 将 cloud 模块重命名为 client 模块 ([eb79eff](https://github.com/cloudcome/utils/commit/eb79eff58f07d99049379e70234a3f7721cebf60))
* **utils-uni:** 新增 cloud 和 database 模块 ([fbadea0](https://github.com/cloudcome/utils/commit/fbadea0b127c0658052577b81746377a033b3d51))
* **utils-uni:** 添加云函数相关工具 ([d24e232](https://github.com/cloudcome/utils/commit/d24e2324750e2c6f5953507bbf64deb2174cbdfd))

## [1.3.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.3.0...@cloudcome/utils-uni@1.3.1) (2025-09-13)

**Note:** Version bump only for package @cloudcome/utils-uni

# [1.3.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.2.8...@cloudcome/utils-uni@1.3.0) (2025-09-12)

### Features

* **utils-uni:** 支持 useCloudDatabase 数据占位功能 ([419115d](https://github.com/cloudcome/utils/commit/419115da622fe2027f4ad70766d9ad368684cdf7))

## [1.2.8](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.2.7...@cloudcome/utils-uni@1.2.8) (2025-09-11)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.2.7](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.2.6...@cloudcome/utils-uni@1.2.7) (2025-09-10)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.2.6](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.2.5...@cloudcome/utils-uni@1.2.6) (2025-09-10)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.2.5](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.2.4...@cloudcome/utils-uni@1.2.5) (2025-09-09)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.2.4](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.2.3...@cloudcome/utils-uni@1.2.4) (2025-09-07)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.2.3](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.2.2...@cloudcome/utils-uni@1.2.3) (2025-09-07)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.2.2](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.2.1...@cloudcome/utils-uni@1.2.2) (2025-09-07)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.2.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.2.0...@cloudcome/utils-uni@1.2.1) (2025-09-07)

### Bug Fixes

* **utils-uni:** 重命名云对象和数据库返回类型 ([95edb6c](https://github.com/cloudcome/utils/commit/95edb6c589b241ae94b8925a0684e8b1e83b4e55))

# [1.2.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.1.2...@cloudcome/utils-uni@1.2.0) (2025-09-01)

### Features

* **utils-uni:** 新增云数据库调用 hook ([d424ff8](https://github.com/cloudcome/utils/commit/d424ff83d3233656afee134e5ae25c85695be46c))
* **utils-uni:** 添加 createUseCloudObject 函数 ([ee27214](https://github.com/cloudcome/utils/commit/ee27214de37ba6fd3fe1eb8e0d3f7588611dca90))

## [1.1.2](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.1.1...@cloudcome/utils-uni@1.1.2) (2025-08-31)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.1.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.1.0...@cloudcome/utils-uni@1.1.1) (2025-08-30)

**Note:** Version bump only for package @cloudcome/utils-uni

# 1.1.0 (2025-08-27)

### Features

* **utils-uni:** 添加 usePageQuery hook 函数 ([3e35818](https://github.com/cloudcome/utils/commit/3e358189ce0f68b538c95f710478f864a1cd0182))
