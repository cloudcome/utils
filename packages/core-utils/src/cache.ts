import type { MaybePromise } from "./types";

export interface CacheOptions {
	maxAge?: number;
}

export interface Cached<T> {
	id: string;
	data: T;
	createdAt: number;
	maxAge: number;
}

export interface AbstractCache<T> {
	get: (id: string) => MaybePromise<Cached<T> | null>;
	set: (id: string, data: T, options?: CacheOptions) => MaybePromise<unknown>;
	del: (id: string) => MaybePromise<unknown>;
}

export class MemoryCache<T> implements AbstractCache<T> {
	private cache: Map<string, Cached<T>> = new Map();

	get(id: string) {
		const cached = this.cache.get(id);

    if (!cached) return null

    if (cached.maxAge > 0 && Date.now() - cached.createdAt > cached.maxAge) {
      this.del(id)
      return null
    }

    return cached
	}

	set(id: string, data: T, options?: CacheOptions) {
		this.cache.set(id, {
      id,
      data,
      createdAt: Date.now(),
      maxAge: options?.maxAge || 0,
    });
	}

	del(id: string) {
		this.cache.delete(id);
	}
}
