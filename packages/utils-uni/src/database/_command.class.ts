export class DbBaseCommand {
  command: string;
  parameter: unknown;

  constructor(command: string, parameter: unknown) {
    this.command = command;
    this.parameter = parameter;
  }

  getValue(db: UniCloud.Database) {
    // @ts-ignore
    return db.command[this.command].apply(db.command, this.parameter);
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
