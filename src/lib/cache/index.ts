import type { CacheStore, RedisLikeClient } from "@/types";

export function createInMemoryStore(): CacheStore {
  const map = new Map<string, { v: unknown; exp: number }>();
  return {
    async get<T>(k: string) {
      const e = map.get(k);
      if (!e) return null;
      if (Date.now() > e.exp) {
        map.delete(k);
        return null;
      }
      return e.v as T;
    },
    async set<T>(k: string, v: T, ttl: number) {
      map.set(k, { v, exp: Date.now() + ttl * 1000 });
    },
    async del(k: string) {
      map.delete(k);
    },
  };
}

export function createRedisStore(redis: RedisLikeClient): CacheStore {
  return {
    async get<T>(k: string) {
      const v = await redis.get(k);
      return v ? JSON.parse(v) : null;
    },
    async set<T>(k: string, v: T, ttl: number) {
      await redis.set(k, JSON.stringify(v), "EX", ttl);
    },
    async del(k: string) {
      await redis.del(k);
    },
  };
}

export async function withCache<T>(
  store: CacheStore,
  key: string,
  ttl: number,
  fn: () => Promise<T>,
): Promise<T> {
  const cached = await store.get<T>(key);
  if (cached !== null) return cached;
  const fresh = await fn();
  await store.set(key, fresh, ttl);
  return fresh;
}

export const cacheStore = createInMemoryStore();
