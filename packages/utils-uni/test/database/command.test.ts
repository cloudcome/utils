import { describe, expect, it } from 'vitest';
import { DbMutateCommand, DbQueryCommand } from '../../src/database/_command.class';
import { dbMutate, dbQuery } from '../../src/database/command';

describe('dbQuery', () => {
  it('应该导出eq命令', () => {
    const command = dbQuery.eq('test');
    expect(command.isQuery).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
    expect(command.command).toBe('eq');
    expect(command.parameter).toBe('test');
  });

  it('应该导出neq命令', () => {
    const command = dbQuery.neq('test');
    expect(command.isQuery).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
    expect(command.command).toBe('neq');
    expect(command.parameter).toBe('test');
  });

  it('应该导出gt命令', () => {
    const command = dbQuery.gt(5);
    expect(command.isQuery).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
    expect(command.command).toBe('gt');
    expect(command.parameter).toBe(5);
  });

  it('应该导出gte命令', () => {
    const command = dbQuery.gte(5);
    expect(command.isQuery).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
    expect(command.command).toBe('gte');
    expect(command.parameter).toBe(5);
  });

  it('应该导出lt命令', () => {
    const command = dbQuery.lt(5);
    expect(command.isQuery).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
    expect(command.command).toBe('lt');
    expect(command.parameter).toBe(5);
  });

  it('应该导出lte命令', () => {
    const command = dbQuery.lte(5);
    expect(command.isQuery).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
    expect(command.command).toBe('lte');
    expect(command.parameter).toBe(5);
  });

  it('应该导出in命令', () => {
    const values = [1, 2, 3];
    const command = dbQuery.in(values);
    expect(command.isQuery).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
    expect(command.command).toBe('in');
    expect(command.parameter).toBe(values);
  });

  it('应该导出nin命令', () => {
    const values = [1, 2, 3];
    const command = dbQuery.nin(values);
    expect(command.isQuery).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
    expect(command.command).toBe('nin');
    expect(command.parameter).toBe(values);
  });

  it('应该导出and命令', () => {
    const conditions = [{ a: 1 }, { b: 2 }];
    const command = dbQuery.and(conditions);
    expect(command.isQuery).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
    expect(command.command).toBe('and');
    expect(command.parameter).toBe(conditions);
  });

  it('应该导出or命令', () => {
    const conditions = [{ a: 1 }, { b: 2 }];
    const command = dbQuery.or(conditions);
    expect(command.isQuery).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
    expect(command.command).toBe('or');
    expect(command.parameter).toBe(conditions);
  });

  it('应该导出size命令', () => {
    const command = dbQuery.size(3);
    expect(command.isQuery).toBe(true);
    expect(command).toBeInstanceOf(DbQueryCommand);
    expect(command.command).toBe('size');
    expect(command.parameter).toBe(3);
  });
});

describe('dbMutate', () => {
  it('应该导出inc命令', () => {
    const command = dbMutate.inc(5);
    expect(command.isMutate).toBe(true);
    expect(command).toBeInstanceOf(DbMutateCommand);
    expect(command.command).toBe('inc');
    expect(command.parameter).toBe(5);
  });

  it('应该导出mul命令', () => {
    const command = dbMutate.mul(3);
    expect(command).toBeInstanceOf(DbMutateCommand);
    expect(command.command).toBe('mul');
    expect(command.parameter).toBe(3);
  });

  it('应该导出set命令', () => {
    const value = { name: 'test' };
    const command = dbMutate.set(value);
    expect(command.isMutate).toBe(true);
    expect(command).toBeInstanceOf(DbMutateCommand);
    expect(command.command).toBe('set');
    expect(command.parameter).toBe(value);
  });

  it('应该导出push命令', () => {
    const value = 'newItem';
    const command = dbMutate.push(value);
    expect(command.isMutate).toBe(true);
    expect(command).toBeInstanceOf(DbMutateCommand);
    expect(command.command).toBe('push');
    expect(command.parameter).toBe(value);
  });

  it('应该导出unshift命令', () => {
    const value = 'newItem';
    const command = dbMutate.unshift(value);
    expect(command.isMutate).toBe(true);
    expect(command).toBeInstanceOf(DbMutateCommand);
    expect(command.command).toBe('unshift');
    expect(command.parameter).toBe(value);
  });

  it('应该导出pop命令', () => {
    const command = dbMutate.pop();
    expect(command).toBeInstanceOf(DbMutateCommand);
    expect(command.command).toBe('pop');
    expect(command.parameter).toBeUndefined();
  });

  it('应该导出shift命令', () => {
    const command = dbMutate.shift();
    expect(command.isMutate).toBe(true);
    expect(command).toBeInstanceOf(DbMutateCommand);
    expect(command.command).toBe('shift');
    expect(command.parameter).toBeUndefined();
  });

  it('应该导出remove命令', () => {
    const command = dbMutate.remove();
    expect(command.isMutate).toBe(true);
    expect(command).toBeInstanceOf(DbMutateCommand);
    expect(command.command).toBe('remove');
    expect(command.parameter).toBeUndefined();
  });
});
