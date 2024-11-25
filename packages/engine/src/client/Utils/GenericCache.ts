export class GenericCache<K, V> {
  private cache = new Map<K, { value: V; expiration?: number }>();

  constructor(private defaultTTL: number = 0) {}

  set(key: K, value: V, ttl?: number): void {
    if (!ttl || !this.defaultTTL) {
      this.cache.set(key, { value, expiration: undefined });

      return;
    }

    const finalTTL = ttl || this.defaultTTL;

    this.cache.set(key, { value, expiration: Date.now() + finalTTL });
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      if (entry.expiration && entry.expiration < Date.now()) {
        this.cache.delete(key);

        return undefined;
      }

      return entry.value;
    }

    return undefined;
  }

  delete(key: K): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
