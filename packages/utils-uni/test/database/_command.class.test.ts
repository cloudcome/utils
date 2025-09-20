import { describe, expect, it, vi } from 'vitest';
import { DbMutateCommand, DbQueryCommand } from '../../src/database/_command.class';

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
    expect(command.command).toBe('eq');
    expect(command.parameter).toBe('test');
  });

  it('应该正确执行getValue方法', () => {
    const command = new DbQueryCommand('eq', 'test');
    const mockDbCommand = {
      eq: vi.fn().mockReturnValue('result'),
    };
    const mockDb: MockDb = {
      command: mockDbCommand,
    };

    const result = command.getValue(mockDb as unknown as UniCloud.Database);
    expect(result).toBe('result');
    expect(mockDbCommand.eq).toHaveBeenCalledWith('test');
  });

  it('应该正确执行getExpression方法', () => {
    const command = new DbQueryCommand('eq', 'test');
    const result = command.getExpression('fieldName');
    expect(result).toEqual({
      $eq: ['fieldName', 'test'],
    });
  });
});

describe('DbMutateCommand', () => {
  it('应该正确创建DbMutateCommand实例', () => {
    const command = new DbMutateCommand('inc', 1);
    expect(command).toBeInstanceOf(DbMutateCommand);
    expect(command.command).toBe('inc');
    expect(command.parameter).toBe(1);
  });

  it('应该正确执行getValue方法', () => {
    const command = new DbMutateCommand('inc', [1]);
    const mockDbCommand = {
      inc: vi.fn().mockReturnValue('result'),
    };
    const mockDb: MockDb = {
      command: mockDbCommand,
    };

    const result = command.getValue(mockDb as unknown as UniCloud.Database);
    expect(result).toBe('result');
    expect(mockDbCommand.inc).toHaveBeenCalledWith(1);
  });

  it('应该正确执行getExpression方法', () => {
    const command = new DbMutateCommand('inc', 1);
    const result = command.getExpression('fieldName');
    expect(result).toEqual({
      $inc: ['fieldName', 1],
    });
  });
});
