## 1. 删除 core 包 exception 模块

- [x] 1.1 删除 `packages/utils-core/src/exception.ts`
- [x] 1.2 删除 `packages/utils-core/test/exception.test.ts`
- [x] 1.3 删除 `packages/docs/src/utils-core/exception.md`
- [x] 1.4 更新 `packages/docs/src/utils-core/index.md` 移除 exception 引用

## 2. 更新下游 database/error.ts

- [x] 2.1 `DbException` 从 `defineException` 改为 `class extends Error`，不保留消息前缀
- [x] 2.2 `isDbException` 更新类型断言为新的 `DbException` class
- [x] 2.3 移除 `defineException` import

## 3. 更新下游类型引用

- [x] 3.1 `_db.class.ts` 中 `parseError` 类型从 `InstanceType<typeof DbException>` 改为 `DbException`
- [x] 3.2 `proxy.ts` 中 `parseError` 类型从 `InstanceType<typeof DbException>` 改为 `DbException`
- [x] 3.3 确认 `_db.class.ts` 和 `proxy.ts` 中 `import type { DbException }` 保持正确

## 4. 验证

- [x] 4.1 运行 `oxlint` 检查无 lint 错误
- [x] 4.2 运行 `vitest run packages/utils-uni/test/database/` 测试通过
- [x] 4.3 运行 `vitest run packages/utils-core/test/` 确保 core 包测试无影响
- [x] 4.4 运行 docs build 验证文档构建通过
