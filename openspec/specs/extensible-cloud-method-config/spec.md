## ADDED Requirements

### Requirement: CreateCloudObjectOptions accepts generic ExtraConfig

`CreateCloudObjectOptions` SHALL accept an optional generic type parameter `ExtraConfig extends Record<string, unknown>` with a default of `Record<string, never>`. The resulting type SHALL be `ExtraConfig & { requiredUser?: boolean; onlyLocalEnv?: boolean; minVersion?: string; maxVersion?: string; noRespond?: boolean }`.

#### Scenario: Consumer uses default (no generic)

- **WHEN** a consumer uses `CreateCloudObjectOptions` without a generic parameter
- **THEN** the type is identical to the current definition with no extra fields

#### Scenario: Consumer provides custom ExtraConfig

- **WHEN** a consumer defines `CreateCloudObjectOptions<{ tenantId: string }>`
- **THEN** the type includes `tenantId` alongside existing fields like `requiredUser` and `onlyLocalEnv`

### Requirement: Generic propagates through CloudObjectContext

`CloudObjectContext` SHALL accept `ExtraConfig` generic and propagate it to the `options` field, which SHALL be typed as `Required<CreateCloudObjectOptions<ExtraConfig>>`.

#### Scenario: Extended context options include custom fields

- **WHEN** a consumer uses `CloudObjectContext<{ audit: boolean }>`
- **THEN** `context.options.audit` is typed as `boolean`

### Requirement: Generic propagates through CreateCloudMethod

`CreateCloudMethod` SHALL accept `ExtraConfig` generic and propagate it to all overload signatures for both the `fn` parameter's context type and the `options` parameter type.

#### Scenario: CreateCloudMethod with extended config

- **WHEN** a consumer uses `CreateCloudMethod<{ customFlag: boolean }>`
- **THEN** the `options` parameter in both overloads accepts `customFlag`

### Requirement: buildCloudMethodCreator propagates generic

`buildCloudMethodCreator` SHALL accept `ExtraConfig` generic and return `CreateCloudMethod<ExtraConfig>`.

#### Scenario: buildCloudMethodCreator called with generic

- **WHEN** `buildCloudMethodCreator<{ audit: boolean }>()` is called
- **THEN** the returned `createMethod` function accepts `audit` in its options parameter

### Requirement: ExtraConfig fields are accessible at runtime in onBefore

Extra configuration fields provided when creating a cloud method SHALL be available on the `options` argument passed to `onBefore`.

#### Scenario: Custom config field accessible in onBefore

- **WHEN** a consumer creates a method with `{ customFlag: true }` and reads it in `onBefore`'s second argument
- **THEN** the value `true` is accessible on `options.customFlag`
