## 1. Type Definitions

- [x] 1.1 Add generic parameter `ExtraConfig extends Record<string, unknown> = Record<string, never>` to `CreateCloudObjectOptions`, using `ExtraConfig & { ... }` intersection
- [x] 1.2 Add generic parameter to `BuildCloudMethodCreatorOptions`, propagate to `onBefore` signature and `CloudObjectContext`
- [x] 1.3 Update `CloudObjectContext` and `_CloudObjectThisAppend` to accept `ExtraConfig` generic
- [x] 1.4 Update `CreateCloudMethod` to accept `ExtraConfig` generic, propagate to all overload signatures
- [x] 1.5 Update `onBefore` signature to receive `(context: CloudObjectContext<ExtraConfig>, options: Required<CreateCloudObjectOptions<ExtraConfig>>) => MaybePromise<unknown>`

## 2. Implementation

- [x] 2.1 Update `buildCloudMethodCreator` function to accept and propagate `ExtraConfig` generic
- [x] 2.2 Pass `createOptions` as second argument to `buildOptions.onBefore(context, createOptions)`
- [x] 2.3 Update all internal type casts to use generic-aware types

## 3. Tests

- [x] 3.1 Add unit tests for `ExtraConfig` generic on all affected types
- [x] 3.2 Add runtime tests verifying `onBefore` receives `options` with `ExtraConfig` fields
- [x] 3.3 Update existing `cloud.test.ts` tests for new `onBefore` two-argument signature
- [x] 3.4 Verify backward compatibility: existing consumers without generic parameter compile without changes

## 4. Verification

- [x] 4.1 Run `lsp_diagnostics` on `packages/utils-uni/src/cloud/method.ts` - zero type errors
- [x] 4.2 Run project build - zero errors
- [x] 4.3 Run all tests - 292/292 pass

## 5. Documentation

- [x] 5.1 Update `packages/docs/src/utils-uni/cloud.md` with generic type signatures
- [x] 5.2 Add `ExtraConfig` usage example to `buildCloudMethodCreator` docs
- [x] 5.3 Update `CloudObjectContext`, `CreateCloudObjectOptions`, `CreateCloudMethod`, `BuildCloudMethodCreatorOptions` doc sections
