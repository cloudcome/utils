import type { DatabaseCommand } from './types';

/**
 * 数据库操作符命令
 */
export const dbCmd = uniCloud.database().command as unknown as DatabaseCommand;

/**
 * 数据库聚合操作符命令
 */
export const dbAgg = uniCloud.database().command.aggregate as UniCloud.AggregateCommand & {
  pipeline: () => UniCloud.AggregateReference & {
    done: () => unknown;
  };
};
