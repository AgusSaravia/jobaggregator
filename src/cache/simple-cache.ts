import type { CacheEntry, CacheOptions } from "./types.js"

export class CacheStorage<T> {
    private storage = new Map<string, CacheEntry<T>>()
    private options: CacheOptions

    constructor(options: CacheOptions) {
        this.options = options
    }

    public get(key: string): T | undefined {
        const item = this.storage.get(key)
        if (!item) {
            return undefined
        }

        if (Date.now() > item.expiresAt) {
            this.storage.delete(key)
            return undefined
        }

        return item.value
    }

    public set(key: string, value: T): void {
        const storageSize = this.storage.size
        const maxSize = this.options.maxSize
        const isKeyStored = this.storage.has(key)
        if (storageSize >= maxSize && !isKeyStored) {
            const firstKey = this.storage.keys().next().value ?? key
            this.storage.delete(firstKey)
        }

        const expiresAt = Date.now() + this.options.ttlSeconds * 1000;
        const cacheEntry: CacheEntry<T> = { value, expiresAt }
        this.storage.set(key, cacheEntry)

    }

    public has(key: string): boolean {
        const item = this.storage.get(key);
        if (!item) return false;

        if (Date.now() > item.expiresAt) {
            this.storage.delete(key);
            return false;
        }

        return true;
    }

    public delete(key: string): unknown | undefined {
        return this.storage.delete(key)
    }

    public clear(): void {
        return this.storage.clear()
    }
}