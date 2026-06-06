// 设置私有属性和静态方法是避免在 update 的时候提示类属性

export class DbBaseCommand {
  protected _isQuery = false;
  protected _isMutate = false;
  protected _isGroup = false;

  constructor(
    protected _command: string,
    protected _parameter: unknown,
    private _options?: {
      formatParameter?: (db: UniCloud.Database) => unknown;
      rewriteValue?: (db: UniCloud.Database, parameter: unknown) => unknown;
    },
  ) {}

  static getValue(cmd: DbBaseCommand, db: UniCloud.Database) {
    if (cmd._options?.rewriteValue) {
      return cmd._options.rewriteValue(db, cmd._parameter);
    }

    return (db.command as unknown as Record<string, (value: unknown) => unknown>)[cmd._command].call(
      db.command,
      cmd._options?.formatParameter?.(db) || cmd._parameter,
    );
  }

  static getExpression(cmd: DbBaseCommand, fieldName: string) {
    return {
      [`$${cmd._command}`]: [fieldName, cmd._parameter],
    };
  }

  static isQueryCommand(cmd: DbBaseCommand) {
    return cmd._isQuery;
  }

  static isMutateCommand(cmd: DbBaseCommand) {
    return cmd._isMutate;
  }
}

export class DbQueryCommand extends DbBaseCommand {
  protected _isQuery = true;
}

export class DbMutateCommand extends DbBaseCommand {
  protected _isMutate = true;
}

export class DbGroupCommand<T> extends DbBaseCommand {
  protected _isGroup = true;

  /** Phantom type marker - compile-time only, used by `group()`'s `infer T` to extract per-accumulator value types */
  declare readonly __type: T;

  toAggregate(): Record<string, unknown> {
    const value = typeof this._parameter === 'string' ? `$${this._parameter}` : this._parameter;
    return { [`$${this._command}`]: value };
  }
}
