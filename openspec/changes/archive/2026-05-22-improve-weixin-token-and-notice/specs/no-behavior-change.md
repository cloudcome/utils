## No Behavioral Changes

本次变更为纯 API 重命名和参数调整，不涉及功能行为变化。

- token 重命名：`getTempDataService` → `queryAccessToken`，`setTempDataService` → `saveAccessToken`
- notice 参数：`clientEnv` → `miniprogramState`，移除隐式映射逻辑

所有已有需求和行为保持不变。
