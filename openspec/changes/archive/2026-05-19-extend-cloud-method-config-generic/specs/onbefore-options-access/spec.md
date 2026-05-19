## ADDED Requirements

### Requirement: onBefore hook receives CreateCloudObjectOptions as second argument

The `onBefore` hook function in `BuildCloudMethodCreatorOptions` SHALL receive two arguments: `(context: CloudObjectContext<ExtraConfig>, options: Required<CreateCloudObjectOptions<ExtraConfig>>)`. The second argument SHALL be the resolved per-method options with all defaults applied, including any `ExtraConfig` fields.

#### Scenario: onBefore receives options argument

- **WHEN** a cloud method is created with `options: { requiredUser: true }` and executed
- **THEN** the `onBefore` hook is called with `context` as first argument and `{ requiredUser: true, onlyLocalEnv: false, noRespond: false }` (with defaults) as second argument

#### Scenario: onBefore can read per-method configuration

- **WHEN** `onBefore` inspects `options.requiredUser`
- **THEN** it receives the boolean value that was set for that specific method

### Requirement: onBefore signature is backward compatible

Existing `onBefore` implementations that accept only one argument SHALL continue to function without modification. JavaScript ignores extra arguments, and TypeScript's structural typing allows `(context: CloudObjectContext) => void` to be assignable to the two-parameter signature.

#### Scenario: Legacy single-argument onBefore

- **WHEN** a consumer defines `onBefore: (context) => { /* ... */ }` with one parameter
- **THEN** the hook executes normally without errors, and the second argument is silently ignored
