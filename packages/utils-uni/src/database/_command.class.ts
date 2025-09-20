export class DbBaseCommand {
  command: string;
  parameter: unknown;

  constructor(command: string, parameter: unknown) {
    this.command = command;
    this.parameter = parameter;
  }

  getValue(db: UniCloud.Database) {
    return (db.command as unknown as Record<string, (value: unknown) => unknown>)[this.command].call(
      db.command,
      this.parameter,
    );
  }

  getExpression(fieldName: string) {
    return {
      [`$${this.command}`]: [fieldName, this.parameter],
    };
  }
}

export class DbQueryCommand extends DbBaseCommand {
  isQueryCommand = true;
}

export class DbMutateCommand extends DbBaseCommand {
  isMutateCommand = true;
}
