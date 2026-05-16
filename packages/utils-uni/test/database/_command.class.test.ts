import { describe, expect, it, vi } from 'vitest';
import { DbBaseCommand, DbMutateCommand, DbQueryCommand } from '../../src/database/_command.class';

// 模拟数据库命令类型
interface MockDbCommand {
  eq?: ReturnType<typeof vi.fn>;
  neq?: ReturnType<typeof vi.fn>;
  gt?: ReturnType<typeof vi.fn>;
  gte?: ReturnType<typeof vi.fn>;
  lt?: ReturnType<typeof vi.fn>;
  lte?: ReturnType<typeof vi.fn>;
  in?: ReturnType<typeof vi.fn>;
  nin?: ReturnType<typeof vi.fn>;
  and?: ReturnType<typeof vi.fn>;
  or?: ReturnType<typeof vi.fn>;
  size?: ReturnType<typeof vi.fn>;
  inc?: ReturnType<typeof vi.fn>;
  mul?: ReturnType<typeof vi.fn>;
  set?: ReturnType<typeof vi.fn>;
  push?: ReturnType<typeof vi.fn>;
  unshift?: ReturnType<typeof vi.fn>;
  pop?: ReturnType<typeof vi.fn>;
  shift?: ReturnType<typeof vi.fn>;
  remove?: ReturnType<typeof vi.fn>;
}

interface MockDb {
  command: MockDbCommand;
}

describe('DbQueryCommand', () => {
  it('应该正确创建DbQueryCommand实例', () => {
    const command = new DbQueryCommand('eq', 'test');
    expect(command).toBeInstanceOf(DbQueryCommand);
    expect(DbBaseCommand.isQueryCommand(command)).toBe(true);
    expect(DbBaseCommand.isMutateCommand(command)).toBe(false);
  });

  it('应该正确执行getValue静态方法', () => {
    const command = new DbQueryCommand('eq', 'test');
    const mockDbCommand = {
      eq: vi.fn<() => void>().mockReturnValue('result'),
    };
    const mockDb: MockDb = {
      command: mockDbCommand,
    };

    const result = DbBaseCommand.getValue(command, mockDb as unknown as UniCloud.Database);
    expect(result).toBe('result');
    expect(mockDbCommand.eq).toHaveBeenCalledWith('test');
  });

  it('应该正确执行getValue静态方法并使用_formatParameter', () => {
    const formatParameter = vi.fn<() => void>().mockReturnValue('formattedValue');
    const command = new DbQueryCommand('eq', 'test', { formatParameter });
    const mockDbCommand = {
      eq: vi.fn<() => void>().mockReturnValue('result'),
    };
    const mockDb: MockDb = {
      command: mockDbCommand,
    };

    const result = DbBaseCommand.getValue(command, mockDb as unknown as UniCloud.Database);
    expect(result).toBe('result');
    expect(formatParameter).toHaveBeenCalledWith(mockDb);
    expect(mockDbCommand.eq).toHaveBeenCalledWith('formattedValue');
  });

  it('应该正确执行getExpression静态方法', () => {
    const command = new DbQueryCommand('eq', 'test');
    const result = DbBaseCommand.getExpression(command, 'fieldName');
    expect(result).toEqual({
      $eq: ['fieldName', 'test'],
    });
  });

  it('应正确执行 rewriteValue 方法', () => {
    const rewriteValue = vi.fn<() => void>().mockReturnValue('rewrittenValue');
    const command = new DbQueryCommand('eq', 'test', { rewriteValue });
    const mockDbCommand = {
      eq: vi.fn<() => void>().mockReturnValue('result'),
    };
    const mockDb: MockDb = {
      command: mockDbCommand,
    };

    const result = DbBaseCommand.getValue(command, mockDb as unknown as UniCloud.Database);
    expect(result).toBe('rewrittenValue');
    expect(rewriteValue).toHaveBeenCalledWith(mockDb, 'test');
  });
});

describe('DbMutateCommand', () => {
  it('应该正确创建DbMutateCommand实例', () => {
    const command = new DbMutateCommand('inc', 1);
    expect(command).toBeInstanceOf(DbMutateCommand);
    expect(DbBaseCommand.isQueryCommand(command)).toBe(false);
    expect(DbBaseCommand.isMutateCommand(command)).toBe(true);
  });

  it('应该正确执行getValue静态方法', () => {
    const command = new DbMutateCommand('inc', 1);
    const mockDbCommand = {
      inc: vi.fn<() => void>().mockReturnValue('result'),
    };
    const mockDb: MockDb = {
      command: mockDbCommand,
    };

    const result = DbBaseCommand.getValue(command, mockDb as unknown as UniCloud.Database);
    expect(result).toBe('result');
    expect(mockDbCommand.inc).toHaveBeenCalledWith(1);
  });

  it('应该正确执行getValue静态方法并使用_formatParameter', () => {
    const formatParameter = vi.fn<() => void>().mockReturnValue('formattedValue');
    const command = new DbMutateCommand('inc', 1, { formatParameter });
    const mockDbCommand = {
      inc: vi.fn<() => void>().mockReturnValue('result'),
    };
    const mockDb: MockDb = {
      command: mockDbCommand,
    };

    const result = DbBaseCommand.getValue(command, mockDb as unknown as UniCloud.Database);
    expect(result).toBe('result');
    expect(formatParameter).toHaveBeenCalledWith(mockDb);
    expect(mockDbCommand.inc).toHaveBeenCalledWith('formattedValue');
  });

  it('应该正确执行getExpression静态方法', () => {
    const command = new DbMutateCommand('inc', 1);
    const result = DbBaseCommand.getExpression(command, 'fieldName');
    expect(result).toEqual({
      $inc: ['fieldName', 1],
    });
  });
});
