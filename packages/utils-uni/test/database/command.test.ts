import { describe, expect, it } from 'vitest';
import { DbBaseCommand, DbMutateCommand, DbQueryCommand } from '../../src/database/_command.class';
import { dbMutate, dbQuery } from '../../src/database/command';

describe('dbQuery', () => {
  it('应该导出eq命令', () => {
    const command = dbQuery.eq('test');
    expect(DbBaseCommand.isQueryCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
  });

  it('应该导出neq命令', () => {
    const command = dbQuery.neq('test');
    expect(DbBaseCommand.isQueryCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
  });

  it('应该导出gt命令', () => {
    const command = dbQuery.gt(5);
    expect(DbBaseCommand.isQueryCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
  });

  it('应该导出gte命令', () => {
    const command = dbQuery.gte(5);
    expect(DbBaseCommand.isQueryCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
  });

  it('应该导出lt命令', () => {
    const command = dbQuery.lt(5);
    expect(DbBaseCommand.isQueryCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
  });

  it('应该导出lte命令', () => {
    const command = dbQuery.lte(5);
    expect(DbBaseCommand.isQueryCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
  });

  it('应该导出in命令', () => {
    const values = [1, 2, 3];
    const command = dbQuery.in(values);
    expect(DbBaseCommand.isQueryCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
  });

  it('应该导出nin命令', () => {
    const values = [1, 2, 3];
    const command = dbQuery.nin(values);
    expect(DbBaseCommand.isQueryCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
  });

  it('应该导出and命令', () => {
    const command = dbQuery.and([dbQuery.eq(1), dbQuery.eq(2)]);
    expect(DbBaseCommand.isQueryCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
  });

  it('应该导出or命令', () => {
    const command = dbQuery.or([dbQuery.eq(1), dbQuery.eq(2)]);
    expect(DbBaseCommand.isQueryCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
  });

  it('应该导出size命令', () => {
    const command = dbQuery.size(3);
    expect(DbBaseCommand.isQueryCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
  });
});

describe('dbMutate', () => {
  it('应该导出inc命令', () => {
    const command = dbMutate.inc(5);
    expect(DbBaseCommand.isMutateCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbMutateCommand);
  });

  it('应该导出mul命令', () => {
    const command = dbMutate.mul(3);
    expect(command).toBeInstanceOf(DbMutateCommand);
  });

  it('应该导出set命令', () => {
    const value = { name: 'test' };
    const command = dbMutate.set(value);
    expect(DbBaseCommand.isMutateCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbMutateCommand);
  });

  it('应该导出push命令', () => {
    const value = 'newItem';
    const command = dbMutate.push(value);
    expect(DbBaseCommand.isMutateCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbMutateCommand);
  });

  it('应该导出unshift命令', () => {
    const value = 'newItem';
    const command = dbMutate.unshift(value);
    expect(DbBaseCommand.isMutateCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbMutateCommand);
  });

  it('应该导出pop命令', () => {
    const command = dbMutate.pop();
    expect(command).toBeInstanceOf(DbMutateCommand);
  });

  it('应该导出shift命令', () => {
    const command = dbMutate.shift();
    expect(DbBaseCommand.isMutateCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbMutateCommand);
  });

  it('应该导出remove命令', () => {
    const command = dbMutate.remove();
    expect(DbBaseCommand.isMutateCommand(command)).toBe(true);
    expect(command).toBeInstanceOf(DbMutateCommand);
  });
});
