## Context

`CreateCloudObjectOptions` (line 85 of `packages/utils-uni/src/cloud/method.ts`) is a fixed interface. Consumers cannot pass custom fields when creating cloud methods, and the `onBefore` hook receives only `CloudObjectContext` without the per-method options. The `context.options` field contains resolved options but lacks custom extension types.

## Goals / Non-Goals

**Goals:**

- Enable consumers to define custom per-method configuration fields via `CreateCloudObjectOptions<ExtraConfig>`.
- Pass per-method options (with custom fields) as second argument to `onBefore`.
- Propagate `ExtraConfig` through `CloudObjectContext`, `CreateCloudMethod`, and `BuildCloudMethodCreatorOptions`.
- Full backward compatibility — all generics default to `Record<string, never>`.

**Non-Goals:**

- No changes to runtime behavior beyond the new `onBefore` second argument.
- No changes to `BuildCloudMethodCreatorOptions` base fields.

## Decisions

### Decision 1: Generic on `CreateCloudObjectOptions` as the primary extension point

`CreateCloudObjectOptions<ExtraConfig>` uses `ExtraConfig & { ... }` intersection. This is where consumers define custom fields when calling `createMethod(fn, { customField: 'value' })`.

### Decision 2: Generic propagation chain

`ExtraConfig` flows through: `CreateCloudObjectOptions` → `_CloudObjectThisAppend` → `CloudObjectContext` → `CreateCloudMethod` → `buildCloudMethodCreator`. Each type accepts the generic with a default of `Record<string, never>`.

### Decision 3: `onBefore` receives both context and raw options

`onBefore(context, options)` where `context` is `CloudObjectContext<ExtraConfig>` (with resolved options on `context.options`) and `options` is `Required<CreateCloudObjectOptions<ExtraConfig>>` (the per-method options with defaults applied). This gives access to both the full context and the specific method's configuration.

## Risks / Trade-offs

- **[Type complexity]** Multiple types now carry generics. → Mitigation: all default to `Record<string, never>`, so most consumers see no change.
- **[onBefore second argument]** Existing single-argument `onBefore` implementations remain compatible — JavaScript ignores extra arguments, and TypeScript allows narrowing.
