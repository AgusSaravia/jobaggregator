export interface CacheOptions {
    ttlSeconds: number
    maxSize: number
}

export interface CacheEntry<T> {
    value: T
    expiresAt: number
}
