import { isFunction } from '@cloudcome/utils-core/type';
import type { AnyObject, MaybeCallable } from '@cloudcome/utils-core/types';
import { Db, type DbSelect, db } from './db';

export type DbUpsertOptions<
  W extends AnyObject,
  S extends DbSelect,
  C extends AnyObject,
  U extends AnyObject,
  R extends AnyObject,
> = {
  collection: string;
  where: W;
  select?: S;
  create: C;
  update: U | ((row: R) => U);
  onBeforeCreate?: () => unknown;
  onAfterCreate?: (id: string) => unknown;
  onBeforeUpdate?: (row: R) => unknown;
  onAfterUpdate?: () => unknown;
};
export async function dbUpsert<
  W extends AnyObject,
  S extends DbSelect,
  C extends AnyObject,
  U extends AnyObject,
  R extends AnyObject,
>(options: DbUpsertOptions<W, S, C, U, R>) {
  const { collection, where, create, update, onBeforeCreate, onAfterCreate, onBeforeUpdate, onAfterUpdate } = options;
  const found = await db.collection(collection).where(where).limit(1).queryOne<R>(true);

  if (found) {
    await onBeforeUpdate?.(found);
    const updateData = isFunction(update) ? update(found) : update;
    const updated = await db.collection(collection).where({ _id: found._id }).update(updateData);
    onAfterUpdate?.();

    return updated;
  }

  await onBeforeCreate?.();
  const created = await db.collection(collection).create(create);
  await onAfterCreate?.(created.id);

  return created;
}
