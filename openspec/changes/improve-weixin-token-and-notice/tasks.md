## 1. token.ts - API 重命名

- [x] 1.1 将 `BuildWeixinAccessTokenServiceOptions` 中的 `getTempDataService` 重命名为 `queryAccessToken`
- [x] 1.2 将 `BuildWeixinAccessTokenServiceOptions` 中的 `setTempDataService` 重命名为 `saveAccessToken`
- [x] 1.3 更新 `buildWeixinAccessTokenService` 函数体中的解构和调用

## 2. notice.ts - 参数显性化

- [x] 2.1 修改 `SendData` 类型：移除 `clientEnv`，新增 `miniprogramState: 'trial' | 'formal'`
- [x] 2.2 更新 `sendWeixinNoticeService` 内部逻辑：直接使用 `miniprogramState` 替代隐式转换
- [x] 2.3 更新 `buildSendWeixinNoticeService` 函数的 JSDoc 示例

## 3. 同步单元测试

- [x] 3.1 更新 `token.test.ts`：将 `getTempDataService` → `queryAccessToken`，`setTempDataService` → `saveAccessToken`
- [x] 3.2 更新 `notice.test.ts`：将 `clientEnv` → `miniprogramState`，调整测试值（`'release'`/`'develop'` → `'formal'`）
- [x] 3.3 运行单元测试确认通过

## 4. 同步文档

- [x] 4.1 更新 `docs/src/utils-uni/weixin.md` 中的 `BuildWeixinAccessTokenServiceOptions` 类型定义
- [x] 4.2 更新 `docs/src/utils-uni/weixin.md` 中的 `SendData` 类型定义
- [x] 4.3 更新 `docs/src/utils-uni/weixin.md` 中的示例代码和警告说明
