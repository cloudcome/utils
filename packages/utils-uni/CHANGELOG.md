# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.51.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.50.3...@cloudcome/utils-uni@1.51.0) (2026-06-21)

### Features

* **utils-uni:** 优化 request 函数类型，dataType 控制 raw 类型 ([7a86e22](https://github.com/cloudcome/utils/commit/7a86e22b8ece4f3fd8fa290d4dd29bd248216d0a))

## [1.50.3](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.50.2...@cloudcome/utils-uni@1.50.3) (2026-06-15)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.50.2](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.50.1...@cloudcome/utils-uni@1.50.2) (2026-06-12)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.50.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.50.0...@cloudcome/utils-uni@1.50.1) (2026-06-10)

**Note:** Version bump only for package @cloudcome/utils-uni

# [1.50.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.49.2...@cloudcome/utils-uni@1.50.0) (2026-06-06)

### Features

* **database:** add group 分组聚合功能 ([1d7d152](https://github.com/cloudcome/utils/commit/1d7d1523afc863dc29d53a0929f08105a4ec97aa))

## [1.49.2](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.49.1...@cloudcome/utils-uni@1.49.2) (2026-06-04)

### Bug Fixes

* **deps:** downgrade @dcloudio/uni-app version ([923e8f5](https://github.com/cloudcome/utils/commit/923e8f5b85630e19bb8f195e5a06d1d2fc5e2590))
* **deps:** 降低 vue 和 @dcloudio/types 版本约束 ([089a46e](https://github.com/cloudcome/utils/commit/089a46e33b134507039c6a81543081de565bac68))

## [1.49.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.49.0...@cloudcome/utils-uni@1.49.1) (2026-05-31)

### Bug Fixes

* **utils-uni:** 支持 showLoading 选项传入函数 ([10bf352](https://github.com/cloudcome/utils/commit/10bf3524ffdaa23235a1f5a9707d68d516bc6596))

# [1.49.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.48.0...@cloudcome/utils-uni@1.49.0) (2026-05-31)

### Features

* **utils-uni:** 调整回调执行顺序并优化类型判断 ([6f35616](https://github.com/cloudcome/utils/commit/6f3561654656ae67cc490649b4315f330e6c85b5))

# [1.48.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.47.0...@cloudcome/utils-uni@1.48.0) (2026-05-30)

### Features

* **utils-uni:** 支持 showLoading 和 showError 配置为函数 ([a245549](https://github.com/cloudcome/utils/commit/a2455495e5ca181cd9021c0554cd0100fe8b4e50))

# [1.47.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.46.0...@cloudcome/utils-uni@1.47.0) (2026-05-29)

### Bug Fixes

* **database:** 修正 1:1 主键关联返回 nullable 类型 ([e2b1544](https://github.com/cloudcome/utils/commit/e2b15449614d65e151ef9c4aa2d636c167cdc3f7))
* **database:** 调整聚合查询中 sample 与 match 的执行顺序 ([2b41e72](https://github.com/cloudcome/utils/commit/2b41e7290e472b3a6418fa36d77df2fa69c9d2c0))

### Features

* **database:** select 不再自动补充 _id 字段 ([7940f8c](https://github.com/cloudcome/utils/commit/7940f8c85883d10744a25f3de409f11b2d5e0d78))

# [2.0.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.46.0...@cloudcome/utils-uni@2.0.0) (2026-05-29)

### BREAKING CHANGES

* **database:** `select()` 不再自动补充 `_id` 字段

**迁移指南：**

如果你的代码依赖隐式 `_id` 字段，需要在 `select()` 中显式添加 `_id: true`：

```typescript
// 之前（会自动包含 _id）
const user = await users.select({ name: true }).firstOrThrow();
// user._id 可用

// 之后（需要显式指定 _id）
const user = await users.select({ _id: true, name: true }).firstOrThrow();
// user._id 可用

// 如果不需要 _id，保持原样即可
const user = await users.select({ name: true }).firstOrThrow();
// user._id 不可用
```

**注意：** 以下情况不受影响：
- `select({})` 空对象仍然返回所有字段（包括 `_id`）
- `select({ _id: false })` 仍然排除 `_id`
- 不使用 `select()` 时仍然返回所有字段

# [1.46.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.45.2...@cloudcome/utils-uni@1.46.0) (2026-05-28)

### Features

* **database:** 优化 1:1 关联查询返回类型推导 ([e2a16b8](https://github.com/cloudcome/utils/commit/e2a16b857912b1c7e133b12c6476a0793bb190fd))

## [1.45.2](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.45.1...@cloudcome/utils-uni@1.45.2) (2026-05-28)

### Bug Fixes

* **database:** 修复 sample 与 limit 及 first 方法冲突 ([764784e](https://github.com/cloudcome/utils/commit/764784eec3980b59725b24dc5a4bcaddf3907083))

## [1.45.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.45.0...@cloudcome/utils-uni@1.45.1) (2026-05-24)

### Bug Fixes

* **uni-db:** 统一many方法返回值类型和结构 ([75687c5](https://github.com/cloudcome/utils/commit/75687c51ff3accca2e81e65757a0821f25711dbe))

# [1.45.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.44.0...@cloudcome/utils-uni@1.45.0) (2026-05-24)

### Features

* **database:** 重构Db类的where相关逻辑与事务校验 ([055a8a2](https://github.com/cloudcome/utils/commit/055a8a22f8eb8f11529fe10126f5603c06383c7e))

# [1.44.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.43.0...@cloudcome/utils-uni@1.44.0) (2026-05-22)

### Features

* **cloud:** add custom error handling support ([1f7e448](https://github.com/cloudcome/utils/commit/1f7e4485d7260e75ac5f98d79f0e7e1b2b85a923))

# [1.43.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.42.0...@cloudcome/utils-uni@1.43.0) (2026-05-22)

### Bug Fixes

* **database:** return raw error when dbCode is empty ([5ab31c6](https://github.com/cloudcome/utils/commit/5ab31c60e500b2868d4e6cbd3707321ca77d9a5b))

### Features

* **database:** 改进数据库错误处理机制 ([d79b706](https://github.com/cloudcome/utils/commit/d79b706625cc75765cbfcf567a4956f07ddfbc2a))

# [1.42.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.41.0...@cloudcome/utils-uni@1.42.0) (2026-05-21)

### Features

* **weixin:** 重命名微信通知与 token 获取相关函数及类型 ([4fcc152](https://github.com/cloudcome/utils/commit/4fcc1522f0a645c3c72296a9694d11d24602ff14))

# [1.41.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.40.0...@cloudcome/utils-uni@1.41.0) (2026-05-21)

### Features

* **weixin:** 重命名通知环境参数与 token 缓存方法 ([06f83ef](https://github.com/cloudcome/utils/commit/06f83efe7ba80522d8743d5dabab400e754243f7))

# [1.40.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.39.0...@cloudcome/utils-uni@1.40.0) (2026-05-19)

### Features

* **uni:** 构建云对象方法创建器支持自定义扩展配置 ([0940350](https://github.com/cloudcome/utils/commit/0940350497bb5a4e48f5309d6262073ffd0a2420))

# [1.39.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.38.0...@cloudcome/utils-uni@1.39.0) (2026-05-18)

### Features

* 移除占位数据相关的测试用例，简化代码结构 ([ca7051e](https://github.com/cloudcome/utils/commit/ca7051ebdbf52c9e38731625592defecb9dd32e4))

# [1.38.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.37.0...@cloudcome/utils-uni@1.38.0) (2026-05-18)

### Features

* 优化 CloudMethod 类型定义，简化参数处理 ([90ae49a](https://github.com/cloudcome/utils/commit/90ae49a001162c91393f64767ccd95c142f98170))

# [1.37.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.36.0...@cloudcome/utils-uni@1.37.0) (2026-05-18)

### Features

* 优化 uniAlert 和 uniToast 函数，增强参数处理和错误提示功能 ([7e60399](https://github.com/cloudcome/utils/commit/7e60399c02fdbfcbfc1b5dc0949c35eb11f6bec6))

# [1.36.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.35.1...@cloudcome/utils-uni@1.36.0) (2026-05-17)

### Features

* 添加 sample 方法，支持随机采样并限制调用次数 ([86c7fd1](https://github.com/cloudcome/utils/commit/86c7fd1665238a2c9d2e7ca375ddc839e58f13a7))

## [1.35.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.35.0...@cloudcome/utils-uni@1.35.1) (2026-05-17)

**Note:** Version bump only for package @cloudcome/utils-uni

# [1.35.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.34.0...@cloudcome/utils-uni@1.35.0) (2026-05-16)

### Bug Fixes

- 修正事务环境下聚合操作的错误处理逻辑 ([17d28f8](https://github.com/cloudcome/utils/commit/17d28f8b66f84fdd1ba4c799364bdfd8d836ddea))
- 增强聚合操作的实例使用检查，防止重复使用相同的数据表实例 ([c560dae](https://github.com/cloudcome/utils/commit/c560dae11f6f5d1e496b3cd7a12f2bfab1b96aa2))
- 更新事务环境下的聚合操作说明，修正删除条件限制 ([c8f9b99](https://github.com/cloudcome/utils/commit/c8f9b998ee7b6119c6f12c0c70ab7df722e5bdfc))

### Features

- 支持事务内查询 ([19b2b53](https://github.com/cloudcome/utils/commit/19b2b535ef9f0787d936e70304beb9b228c161c0))
- 添加微信工具模块及相关文档，包括 access_token 获取和订阅消息发送服务 ([792956e](https://github.com/cloudcome/utils/commit/792956e5549f49bd072c27d098570a8e9cbeb6aa))
- 添加微信通知和访问令牌服务的实现及测试 ([f8f815f](https://github.com/cloudcome/utils/commit/f8f815fa3c941fb5acd6a8fea84269051994e245))

# [1.34.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.33.0...@cloudcome/utils-uni@1.34.0) (2026-05-13)

### Features

- **utils-uni:** 重构并添加多个钩子函数以支持应用和页面生命周期管理 ([3429a65](https://github.com/cloudcome/utils/commit/3429a654219c632aaceecd9c804f80d309e9ce87))

# [1.33.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.32.0...@cloudcome/utils-uni@1.33.0) (2026-05-13)

### Features

- **client:** 为云对象方法添加泛型类型支持 ([93a98af](https://github.com/cloudcome/utils/commit/93a98afdd7f74ee45714aa882bf418b389217abf))

# [1.32.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.31.1...@cloudcome/utils-uni@1.32.0) (2026-05-11)

### Features

- **cloud:** 添加 HTTP 请求工具函数 ([a45e5d6](https://github.com/cloudcome/utils/commit/a45e5d67b829cfd0172cfcfe944187b71ffb60db))
- **database:** 添加分批遍历数据库表功能 ([60b5b90](https://github.com/cloudcome/utils/commit/60b5b907c9e3a479ed04816408582cb49cd1745d))

## [1.31.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.31.0...@cloudcome/utils-uni@1.31.1) (2026-05-09)

**Note:** Version bump only for package @cloudcome/utils-uni

# [1.31.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.30.4...@cloudcome/utils-uni@1.31.0) (2026-05-05)

### Bug Fixes

- **count:** 禁止在事务模式下调用 count() 方法 ([443cca8](https://github.com/cloudcome/utils/commit/443cca8d53629ba1278c7d182e09618d544c2493))

### Features

- **transaction:** 支持事务模式下的删除操作 ([d07f9e2](https://github.com/cloudcome/utils/commit/d07f9e2b76c7f9eb50a8fe4e04cbf905e68004c1))

## [1.30.4](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.30.3...@cloudcome/utils-uni@1.30.4) (2026-05-04)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.30.3](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.30.2...@cloudcome/utils-uni@1.30.3) (2026-05-03)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.30.2](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.30.1...@cloudcome/utils-uni@1.30.2) (2026-04-12)

### Bug Fixes

- **database:** 更新查询空数据时的错误码为firstOrThrow ([8a48780](https://github.com/cloudcome/utils/commit/8a487803a03e00aea6a50b2a4d96cdbb6a6b682d))

## [1.30.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.30.0...@cloudcome/utils-uni@1.30.1) (2026-02-06)

**Note:** Version bump only for package @cloudcome/utils-uni

# [1.30.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.29.7...@cloudcome/utils-uni@1.30.0) (2026-01-05)

### Features

- **database:** 增加类型导出 ([21b0228](https://github.com/cloudcome/utils/commit/21b0228402f9f216cf6e2316a3cd8943489ae933))
- 新增 dbQuery.regExp ([ff65627](https://github.com/cloudcome/utils/commit/ff656278957dcba578e7016eb5a9ce9598ee0ae9))

## [1.29.7](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.29.6...@cloudcome/utils-uni@1.29.7) (2025-12-22)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.29.6](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.29.5...@cloudcome/utils-uni@1.29.6) (2025-12-04)

### Bug Fixes

- 修复对 dcloud 依赖的版本号 ([eddcac1](https://github.com/cloudcome/utils/commit/eddcac161d33e278ac9a8a0cc81b30c0942aaf9a))

## [1.29.5](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.29.4...@cloudcome/utils-uni@1.29.5) (2025-12-04)

### Bug Fixes

- 修复数据库命令映射逻辑错误 ([fe46573](https://github.com/cloudcome/utils/commit/fe46573dd997bcc144901229c0cea816aa660a8e))

## [1.29.4](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.29.3...@cloudcome/utils-uni@1.29.4) (2025-11-30)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.29.3](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.29.2...@cloudcome/utils-uni@1.29.3) (2025-11-25)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.29.2](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.29.1...@cloudcome/utils-uni@1.29.2) (2025-11-14)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.29.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.29.0...@cloudcome/utils-uni@1.29.1) (2025-11-10)

### Bug Fixes

- 修复更新操作中 \_id 字段传递问题 ([78d4eda](https://github.com/cloudcome/utils/commit/78d4eda5d2c60bd8034b149c29420e3bd34f18f6))

# [1.29.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.28.3...@cloudcome/utils-uni@1.29.0) (2025-10-31)

### Features

- **api:** 更新版本校验错误信息并支持非响应模式 ([04bb9b0](https://github.com/cloudcome/utils/commit/04bb9b064b8db5f2d580a29cf7622849ae080f46))
- **api:** 添加云方法执行前钩子函数支持 ([0d49710](https://github.com/cloudcome/utils/commit/0d49710c813d993cb620b539779259f2251314c7))

## [1.28.3](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.28.2...@cloudcome/utils-uni@1.28.3) (2025-10-27)

### Bug Fixes

- **db:** 修正查询条件中 \_where 和 \_lookupAs 的处理逻辑 ([b27ec5d](https://github.com/cloudcome/utils/commit/b27ec5d07e8674edf2738b63240831368d8517e0))

## [1.28.2](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.28.1...@cloudcome/utils-uni@1.28.2) (2025-10-27)

### Bug Fixes

- **db:** 调整关联查询时主表查询逻辑顺序 ([b8848c0](https://github.com/cloudcome/utils/commit/b8848c0eb457587675d4e44a10be0b9dad3be5f3))
- 修复聚合查询未正确应用 LIMIT 的问题 ([a0bfc3a](https://github.com/cloudcome/utils/commit/a0bfc3a34f7cf44e519023f8290a192483d3e3bf))

## [1.28.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.28.0...@cloudcome/utils-uni@1.28.1) (2025-10-18)

**Note:** Version bump only for package @cloudcome/utils-uni

# [1.28.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.27.1...@cloudcome/utils-uni@1.28.0) (2025-10-16)

### Features

- **db:** 优化数据库实例克隆逻辑，新增事务状态访问器 ([d5118b4](https://github.com/cloudcome/utils/commit/d5118b4cfd0302a3ab731db383da9e31207b2114))

## [1.27.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.27.0...@cloudcome/utils-uni@1.27.1) (2025-10-16)

**Note:** Version bump only for package @cloudcome/utils-uni

# [1.27.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.26.0...@cloudcome/utils-uni@1.27.0) (2025-10-16)

### Features

- **api:** 增加加载与错误提示回调函数支持 ([b411ccb](https://github.com/cloudcome/utils/commit/b411ccbfe03942c71ffddbe6f878b87ff67e6395))
- 增加版本兼容性校验能力 ([f1e44be](https://github.com/cloudcome/utils/commit/f1e44bee110f45f4e9d1ab32cd06ee7322964f32))

# [1.26.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.25.1...@cloudcome/utils-uni@1.26.0) (2025-10-15)

### Features

- **db:** 优化查询条件获取逻辑，新增返回原始条件选项 ([9bbaea9](https://github.com/cloudcome/utils/commit/9bbaea992759208e9230ff56ab7237d73c76bf24))
- **db:** 优化聚合查询先后逻辑 ([854d5a8](https://github.com/cloudcome/utils/commit/854d5a8d8f99c6f73b333ee942e20abac79ee41b))

## [1.25.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.25.0...@cloudcome/utils-uni@1.25.1) (2025-10-15)

**Note:** Version bump only for package @cloudcome/utils-uni

# [1.25.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.24.1...@cloudcome/utils-uni@1.25.0) (2025-10-15)

### Features

- **api:** 支持分页查询时指定返回字段与过滤条件类型定义 ([64a6535](https://github.com/cloudcome/utils/commit/64a65353c37be03736f760fa0d594517eed3f2b0))

## [1.24.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.24.0...@cloudcome/utils-uni@1.24.1) (2025-10-13)

### Bug Fixes

- **db:** 过滤查询条件中的 undefined 值 ([280e7e8](https://github.com/cloudcome/utils/commit/280e7e8cb866585cfc08166d62004237db44fa03))

# [1.24.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.23.0...@cloudcome/utils-uni@1.24.0) (2025-10-12)

### Bug Fixes

- **db:** 修正查询字段处理逻辑，统一 select 与 order 的合并规则 ([e5bbde9](https://github.com/cloudcome/utils/commit/e5bbde9c53e0243c9f25251c7cd1b53bf1c80e26))

### Features

- **db:** 实现数据库分页查询功能 ([5ff33dc](https://github.com/cloudcome/utils/commit/5ff33dcfbaa91ce911b2b4c8806318940a8f484a))

# [1.23.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.22.1...@cloudcome/utils-uni@1.23.0) (2025-10-10)

### Features

- 新增页面生命周期 hook 函数用于处理页面加载与显示事件 ([cb27ce3](https://github.com/cloudcome/utils/commit/cb27ce36233c3ca6411e27166919564ccd5d03a4))
- 添加应用显示状态生命周期钩子函数 useAppShow ([5f2cd84](https://github.com/cloudcome/utils/commit/5f2cd848aba2aaa34b5a9d85e89511be40169a9c))

## [1.22.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.22.0...@cloudcome/utils-uni@1.22.1) (2025-10-07)

**Note:** Version bump only for package @cloudcome/utils-uni

# [1.22.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.21.0...@cloudcome/utils-uni@1.22.0) (2025-09-30)

### Features

- **utils-uni:** 增强数据库命令支持参数格式化函数 ([eb8e8ef](https://github.com/cloudcome/utils/commit/eb8e8efee20baf903991cad8eab6f749faafa116))
- **utils-uni:** 添加版本号常量 ([7d3eb62](https://github.com/cloudcome/utils/commit/7d3eb62bb617b42127b69071e4c3e586361e3a36))

# [1.21.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.20.2...@cloudcome/utils-uni@1.21.0) (2025-09-29)

### Features

- **database:** 移除 DbProxy 类型并统一使用 Db 类型 ([4bfe5c9](https://github.com/cloudcome/utils/commit/4bfe5c90df95cf48a024c8943ee0cab81f56e6d8))
- **utils-uni:** 添加事务模式下的原始数据库实例支持 ([1471622](https://github.com/cloudcome/utils/commit/1471622eab020d2e6774a1a87f6ce1a227b078dc))

## [1.20.2](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.20.1...@cloudcome/utils-uni@1.20.2) (2025-09-28)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.20.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.20.0...@cloudcome/utils-uni@1.20.1) (2025-09-28)

**Note:** Version bump only for package @cloudcome/utils-uni

# [1.20.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.19.1...@cloudcome/utils-uni@1.20.0) (2025-09-27)

### Bug Fixes

- **utils-uni:** 调整数据库输出解析逻辑 ([1e06515](https://github.com/cloudcome/utils/commit/1e0651598b273d1ade8f673258335f222c9f569d))

### Features

- **utils-uni:** 为云对象调用添加请求生命周期回调支持 ([253cf13](https://github.com/cloudcome/utils/commit/253cf1336bd16b2322b98fd288d46eb71461b6d0))
- **utils-uni:** 为数据库代理添加自定义错误处理选项 ([65bad04](https://github.com/cloudcome/utils/commit/65bad041e402c6a9f9d9e9fcc6485325ae32fb15))
- **utils-uni:** 为数据库类添加options属性访问器 ([126a558](https://github.com/cloudcome/utils/commit/126a558c2d528640d7e09220422ccd8805c54679))
- **utils-uni:** 优化云对象导入与调用逻辑 ([82d5f3e](https://github.com/cloudcome/utils/commit/82d5f3efaf134d6eb6338ff64df51f73c1cf3193))
- **utils-uni:** 引入统一错误类型 UniError 并优化数据库错误处理 ([612a6aa](https://github.com/cloudcome/utils/commit/612a6aa0334406be5ac8969e73d7c8e05bab25d8))
- **utils-uni:** 添加 showLoading 和 showError 选项支持 ([925011e](https://github.com/cloudcome/utils/commit/925011eca54dffcc9f72c67540f8dd1f5aed5a73))

## [1.19.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.19.0...@cloudcome/utils-uni@1.19.1) (2025-09-26)

### Bug Fixes

- **utils-uni:** 优化数据库查询逻辑以支持事务模式下的更新操作 ([bcc842e](https://github.com/cloudcome/utils/commit/bcc842e3f61facb79a5c6e6c63c14de490a507bb))

# [1.19.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.18.1...@cloudcome/utils-uni@1.19.0) (2025-09-23)

### Features

- **utils-uni:** 为数据库查询方法添加事务模式检查 ([a7c0e02](https://github.com/cloudcome/utils/commit/a7c0e028a26db7046db5bbe33e8f1e210d4deb27))
- **utils-uni:** 重构数据库类型定义与关联查询配置 ([61353cb](https://github.com/cloudcome/utils/commit/61353cbff3b37badfaeae307c0c0e99d0635d1c8))

## [1.18.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.18.0...@cloudcome/utils-uni@1.18.1) (2025-09-23)

### Bug Fixes

- **utils-uni:** 修复数据库select方法的类型推导问题 ([6711755](https://github.com/cloudcome/utils/commit/6711755b2e57e84186f3e86da2bd42615e7f348a))

# [1.18.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.17.1...@cloudcome/utils-uni@1.18.0) (2025-09-22)

### Bug Fixes

- **utils-uni:** 修复数据库唯一性检查中的类型错误 ([2e268af](https://github.com/cloudcome/utils/commit/2e268afa29d0574dbc38df26fc4e53b174a4208b))

### Features

- **database:** 重构 DbBaseCommand 类以提升封装性和可维护性 ([3a29bf6](https://github.com/cloudcome/utils/commit/3a29bf654130be61a31f69a43760c931d23659cd))
- **utils-uni:** 修改 DbCreate 类型定义以排除 \_id 字段 ([f57b448](https://github.com/cloudcome/utils/commit/f57b448b18a7b75d0c280e3c4deabefecccd6d17))
- **utils-uni:** 改进 DbUpdate 类型以支持嵌套更新 ([75fcc96](https://github.com/cloudcome/utils/commit/75fcc963dd1f768cb1389f93a2ae3155754273e7))

## [1.17.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.17.0...@cloudcome/utils-uni@1.17.1) (2025-09-21)

### Bug Fixes

- **utils-uni:** 修改 DbOrder 类型定义以支持可选排序字段 ([ba7ffe9](https://github.com/cloudcome/utils/commit/ba7ffe9b7c84786b87162e58713082341c00249f))

# [1.17.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.16.0...@cloudcome/utils-uni@1.17.0) (2025-09-21)

### Bug Fixes

- **utils-uni:** 更新数据库更新方法的类型定义 ([3fd820e](https://github.com/cloudcome/utils/commit/3fd820e736b1ffa7f30a5c2929d94f46ff1840b7))

### Features

- **database:** 导出 WithTransaction 类型并更新函数签名 ([7f56ccd](https://github.com/cloudcome/utils/commit/7f56ccdcd48a9d0f0bd181657e978afda6fa936f))

# [1.16.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.15.0...@cloudcome/utils-uni@1.16.0) (2025-09-21)

### Features

- **utils-uni:** 支持动态方法名调用云对象方法 ([6987011](https://github.com/cloudcome/utils/commit/6987011837b3d06b7c456c034a10644063ae228a))

# [1.15.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.14.0...@cloudcome/utils-uni@1.15.0) (2025-09-21)

### Bug Fixes

- **utils-uni:** 修改数据库查询条件映射方法 ([c563001](https://github.com/cloudcome/utils/commit/c563001726ab37709ef93b922b05e14f3968c62d))

### Features

- **database:** 修改 queryOne 方法返回类型和错误处理 ([042cfd0](https://github.com/cloudcome/utils/commit/042cfd00b33f22fe9b2011f59be8fe26a58f4d44))
- **utils-uni:** 优化数据库命令类继承结构并调整类型导入 ([712e8f8](https://github.com/cloudcome/utils/commit/712e8f8497b898d037824eb7b51725631d2191a3))

# [1.14.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.13.0...@cloudcome/utils-uni@1.14.0) (2025-09-21)

### Features

- **utils-uni:** 为 DbLookupOptions 添加泛型参数以支持条件类型 ([f2f58d7](https://github.com/cloudcome/utils/commit/f2f58d72def890cedf53b66142237fb9a1673b9e))
- **utils-uni:** 支持 lookup as 后可以查询类型支持 ([67bf79b](https://github.com/cloudcome/utils/commit/67bf79bbdcce7bff863d80d4b9ea71889d7cfe43))
- **utils-uni:** 添加数据库操作命令类型定义 ([8ee7264](https://github.com/cloudcome/utils/commit/8ee7264e18ec954f5f15c8132ad4a5e487da7666))
- **utils-uni:** 重构数据库命令模块，引入命令类抽象 ([80ef24f](https://github.com/cloudcome/utils/commit/80ef24f75f90a6b28fd8cee5b343588eef7d1109))
- **utils-uni:** 重构数据库类以提升查询与聚合能力 ([1f577fc](https://github.com/cloudcome/utils/commit/1f577fc1fc89c351791c478064aa347f63244406))

# [1.13.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.12.0...@cloudcome/utils-uni@1.13.0) (2025-09-20)

### Features

- **cloud:** 重命名云对象暴露相关类型和函数 ([f5857dc](https://github.com/cloudcome/utils/commit/f5857dc780ec59dc940aeebeb24a3bf98ae92d2f))
- **cloud:** 重命名云对象相关类型和导入路径 ([a45b6be](https://github.com/cloudcome/utils/commit/a45b6be2ea088be5e90589fa57c97ca2cf72fb05))
- **cloud:** 重构云对象方法相关类型和函数命名 ([e74b24f](https://github.com/cloudcome/utils/commit/e74b24f8f0e515ce8ec99030aa67e0f3af00ebef))
- **utils-uni:** 导出数据库命令模块并优化导入方式 ([7baff78](https://github.com/cloudcome/utils/commit/7baff78a2f62bebaaac6bae7fd01ffb57ca37463))
- **utils-uni:** 新增 dbUnique 函数 ([2a3f2f9](https://github.com/cloudcome/utils/commit/2a3f2f939e83f490672b8e273d303fe94f2b8544))
- **utils-uni:** 新增数据库执行结果解析函数并优化模块结构 ([acd1295](https://github.com/cloudcome/utils/commit/acd1295eaae79b9d12b29c38c32f7f6150384ce0))
- **utils-uni:** 重命名云函数输出解析工具函数 ([3537684](https://github.com/cloudcome/utils/commit/35376842e9e836165b7ec54f0a01aea2f9e49706))
- **utils-uni:** 重命名云对象输出解析函数及类型 ([923cd2a](https://github.com/cloudcome/utils/commit/923cd2a6bf36ae427a921d8ab07c8d600a966b79))
- **utils-uni:** 重命名数据库相关类型和接口 ([62eeac3](https://github.com/cloudcome/utils/commit/62eeac318c82997337b8348e71ecc1886a2836ae))

# [1.12.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.11.0...@cloudcome/utils-uni@1.12.0) (2025-09-19)

### Features

- **utils-uni:** 优化数据库字段选择类型逻辑 ([b54ce82](https://github.com/cloudcome/utils/commit/b54ce8238bcd7efee997c4369d54103a433ac85a))
- **utils-uni:** 增强数据库查询字段校验功能 ([10e26d0](https://github.com/cloudcome/utils/commit/10e26d0376b4f82b14e70c24e14abc5ee1368bca))
- **utils-uni:** 增强数据库查询字段类型校验 ([99432cd](https://github.com/cloudcome/utils/commit/99432cde074e257288ebf95a16c82a793ca58591))
- **utils-uni:** 增强数据库类型定义支持查询与更新命令 ([267dc5a](https://github.com/cloudcome/utils/commit/267dc5ae17e97d2ce1fda7fb9645a958365fa269))

# [1.11.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.10.0...@cloudcome/utils-uni@1.11.0) (2025-09-19)

### Bug Fixes

- **utils-uni:** 修正 ExtractUniCloudObjectExpose 类型定义 ([2292a6b](https://github.com/cloudcome/utils/commit/2292a6b83224e51ddfa091ecdaf6487a91eeed79))

### Features

- **cloud:** 重命名云对象类型并增强类型定义 ([dab47de](https://github.com/cloudcome/utils/commit/dab47dea5c07b1d2c23589aa66e25d07aaf60c13))

# [1.10.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.9.0...@cloudcome/utils-uni@1.10.0) (2025-09-18)

### Features

- **utils-uni:** 增加仅允许本地环境运行的云函数功能 ([5da62ec](https://github.com/cloudcome/utils/commit/5da62ecd8a10ea12cb37b2aeb7e4813b672f4fbd))
- **utils-uni:** 导出 parseCloudObjectOutput 函数 ([3b083ac](https://github.com/cloudcome/utils/commit/3b083ac3ba5204cc9ae633e6fa0489c6fa94f1dd))
- **utils-uni:** 将 UniIdCloudObject 重命名为 UniIdCommonModule ([e2039fc](https://github.com/cloudcome/utils/commit/e2039fc8703508b961b9f4b9055c7454f8abc7ca))
- **utils-uni:** 新增 parseCloudModuleOutput 函数用于解析云函数模块输出结果 ([d11ce37](https://github.com/cloudcome/utils/commit/d11ce378883a8d4797b4b5f8cbf0cd3503e8220e))

# [1.9.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.8.0...@cloudcome/utils-uni@1.9.0) (2025-09-18)

### Features

- **database:** 更新数据库操作命令类型定义及函数参数名称 ([ed0d256](https://github.com/cloudcome/utils/commit/ed0d256dd3041a826f33d8c2f88cf308d7c3987b))
- **database:** 更新数据库查询处理逻辑 ([38b7205](https://github.com/cloudcome/utils/commit/38b72052092389028302846ee6f775322e4c4b3e))
- **utils-uni:** 调整云函数返回格式并优化响应处理 ([6917dc3](https://github.com/cloudcome/utils/commit/6917dc3c55afd58ab8cfec4d7d697aa97126b17c))

# [1.8.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.7.1...@cloudcome/utils-uni@1.8.0) (2025-09-17)

### Bug Fixes

- **database:** 修复 aggregate 查询中 $unwind 阶段的路径表达式 ([7201cac](https://github.com/cloudcome/utils/commit/7201cac1f47296fb40339baa7145fa442f38dc6d))
- **database:** 修复 where 查询逻辑 ([f7a36f7](https://github.com/cloudcome/utils/commit/f7a36f7958b1a348e8c908fba1d841f6bff939e6))

### Features

- **database:** 优化 dbUpsert 函数的 onAfterUpdate 回调 ([b4f70ae](https://github.com/cloudcome/utils/commit/b4f70ae9ceaaf28fb64feaae2b8aa13d50e6a012))
- **database:** 增加对重复使用数据表实例的错误处理 ([d91152a](https://github.com/cloudcome/utils/commit/d91152a32fbdcdaab45e67afb8b4ba4cb1f94816))
- **database:** 增强 upsert 函数功能 ([e7ed3e7](https://github.com/cloudcome/utils/commit/e7ed3e7cf2f3c4178e300f5054f125366e4b9268))
- **database:** 支持数据库关联查询 ([9c7bfe8](https://github.com/cloudcome/utils/commit/9c7bfe8a8f8015d72d84d11cfe4690348ecbbc59))

## [1.7.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.7.0...@cloudcome/utils-uni@1.7.1) (2025-09-15)

### Bug Fixes

- **utils-uni:** 修复 db.where 方法对 \_id 传参值类型的判断 ([9483f44](https://github.com/cloudcome/utils/commit/9483f4434e65807dc1efd038c507c5406669d78f))

# [1.7.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.6.0...@cloudcome/utils-uni@1.7.0) (2025-09-15)

### Features

- **database:** 重构 table 方法并优化 API 设计 ([6a88d0f](https://github.com/cloudcome/utils/commit/6a88d0f2223e1e55a2d0ba9ef9c06b8736566ece))

# [1.6.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.5.1...@cloudcome/utils-uni@1.6.0) (2025-09-14)

### Features

- **database:** 重构数据库方法返回值 ([43561d3](https://github.com/cloudcome/utils/commit/43561d3fd8412f542962308d4c0d42365524bb4e))
- **utils-uni:** 重构数据库操作类 Db，更完善的支持类型系统 ([085c6fb](https://github.com/cloudcome/utils/commit/085c6fba9f46c8f95589f2001e6d7a9ed8b90c0e))

## [1.5.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.5.0...@cloudcome/utils-uni@1.5.1) (2025-09-14)

**Note:** Version bump only for package @cloudcome/utils-uni

# [1.5.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.4.0...@cloudcome/utils-uni@1.5.0) (2025-09-14)

### Features

- **database:** 添加数据库事务功能 ([4f990e9](https://github.com/cloudcome/utils/commit/4f990e92ee3392e6016c2cb018b87c5f159178c5))
- **database:** 重构数据库操作并添加新功能 ([6ab7a86](https://github.com/cloudcome/utils/commit/6ab7a86c8ad406d42b99f4881b4e5dda5cf76468))

# [1.4.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.3.1...@cloudcome/utils-uni@1.4.0) (2025-09-13)

### Bug Fixes

- **utils-uni:** 修复错误消息处理逻辑 ([7006f9e](https://github.com/cloudcome/utils/commit/7006f9e9abb7ceaff75e9139ce7cb49bd379bf5e))

### Features

- **database:** 新增数据库操作模块 ([ce0ac49](https://github.com/cloudcome/utils/commit/ce0ac49ae3f84e7c9e2763e8426392888a59c724))
- **utils-uni:** 为 createUseCloudObject 添加错误信息回退功能 ([2bd8392](https://github.com/cloudcome/utils/commit/2bd83929e31f3ffc586911266a461f19a2fb788a))
- **utils-uni:** 在 UniCloudObjectOutput 类型中添加 requestId 字段 ([55662bb](https://github.com/cloudcome/utils/commit/55662bb9a5dd40ff9c2d27b447b89b70feb3cda1))
- **utils-uni:** 将 cloud 模块重命名为 client 模块 ([eb79eff](https://github.com/cloudcome/utils/commit/eb79eff58f07d99049379e70234a3f7721cebf60))
- **utils-uni:** 新增 cloud 和 database 模块 ([fbadea0](https://github.com/cloudcome/utils/commit/fbadea0b127c0658052577b81746377a033b3d51))
- **utils-uni:** 添加云函数相关工具 ([d24e232](https://github.com/cloudcome/utils/commit/d24e2324750e2c6f5953507bbf64deb2174cbdfd))

## [1.3.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.3.0...@cloudcome/utils-uni@1.3.1) (2025-09-13)

**Note:** Version bump only for package @cloudcome/utils-uni

# [1.3.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.2.8...@cloudcome/utils-uni@1.3.0) (2025-09-12)

### Features

- **utils-uni:** 支持 useCloudDatabase 数据占位功能 ([419115d](https://github.com/cloudcome/utils/commit/419115da622fe2027f4ad70766d9ad368684cdf7))

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

- **utils-uni:** 重命名云对象和数据库返回类型 ([95edb6c](https://github.com/cloudcome/utils/commit/95edb6c589b241ae94b8925a0684e8b1e83b4e55))

# [1.2.0](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.1.2...@cloudcome/utils-uni@1.2.0) (2025-09-01)

### Features

- **utils-uni:** 新增云数据库调用 hook ([d424ff8](https://github.com/cloudcome/utils/commit/d424ff83d3233656afee134e5ae25c85695be46c))
- **utils-uni:** 添加 createUseCloudObject 函数 ([ee27214](https://github.com/cloudcome/utils/commit/ee27214de37ba6fd3fe1eb8e0d3f7588611dca90))

## [1.1.2](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.1.1...@cloudcome/utils-uni@1.1.2) (2025-08-31)

**Note:** Version bump only for package @cloudcome/utils-uni

## [1.1.1](https://github.com/cloudcome/utils/compare/@cloudcome/utils-uni@1.1.0...@cloudcome/utils-uni@1.1.1) (2025-08-30)

**Note:** Version bump only for package @cloudcome/utils-uni

# 1.1.0 (2025-08-27)

### Features

- **utils-uni:** 添加 usePageQuery hook 函数 ([3e35818](https://github.com/cloudcome/utils/commit/3e358189ce0f68b538c95f710478f864a1cd0182))
