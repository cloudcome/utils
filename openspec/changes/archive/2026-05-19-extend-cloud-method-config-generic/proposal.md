## Why

`CreateCloudObjectOptions` is a fixed type — consumers cannot pass custom configuration when creating cloud methods, and the `onBefore` hook only receives `CloudObjectContext` without access to per-method options. This limits flexibility when users need per-method custom config (e.g., audit flags, tenant IDs) accessible in the `onBefore` hook.

## What Changes

- Add generic `ExtraConfig` to `CreateCloudObjectOptions`, allowing per-method custom configuration fields.
- Propagate `ExtraConfig` through `CloudObjectContext`, `_CloudObjectThisAppend`, `CreateCloudMethod`, and `BuildCloudMethodCreatorOptions`.
- Pass per-method `CreateCloudObjectOptions<ExtraConfig>` as second argument to `onBefore` hook.
- All generics default to `Record<string, never>` for full backward compatibility.

## Capabilities

### New Capabilities

- `extensible-cloud-method-config`: Generic type parameter on `CreateCloudObjectOptions` and propagated types, enabling consumer-defined per-method configuration.
- `onbefore-options-access`: Pass `CreateCloudObjectOptions` as second parameter to `onBefore` hook.

### Modified Capabilities

## Impact

- `packages/utils-uni/src/cloud/method.ts`: Core type definitions and `buildCloudMethodCreator` implementation.
- `packages/docs/src/utils-uni/cloud.md`: Documentation updated with generic signatures and examples.
- `packages/utils-uni/test/cloud/method.test.ts`: New test file for generic and runtime behavior.
- `packages/utils-uni/test/cloud.test.ts`: Updated existing `onBefore` tests for two-argument signature.
- Fully backward compatible — default generics mean existing code works unchanged.
