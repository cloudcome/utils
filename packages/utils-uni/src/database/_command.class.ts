// 设置私有属性和静态方法是避免在 update 的时候提示类属性

export class DbBaseCommand {
  protected _isQuery = false;
  protected _isMutate = false;

  constructor(
    private _command: string,
    private _parameter: unknown,
    private _formatParameter?: (db: UniCloud.Database) => unknown,
  ) {}

  static getValue(cmd: DbBaseCommand, db: UniCloud.Database) {
    return (db.command as unknown as Record<string, (value: unknown) => unknown>)[cmd._command].call(
      db.command,
      cmd._formatParameter?.(db) || cmd._parameter,
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
