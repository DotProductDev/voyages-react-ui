class CacheEntry<T extends object> {
    constructor(private data: T, private expiration: Date) {
    }

    get = () => new Date() > this.expiration ? null : this.data;
}

export class MemoryCache<T extends object> {
    _mem = new Map<string, CacheEntry<T>>();

    constructor(public expirationSeconds: number) {
    }

    get(key: string) {
        const entry = this._mem.get(key);
        if (entry) {
            const cached = entry.get();
            if (cached) {
                return cached;
            }
            // Delete the reference since it either expired or was GC'ed.
            this._mem.delete(key);
        }
        return null;
    }

    set(key: string, data: T) {
        let expiration = new Date();
        expiration = new Date(expiration.getDate() + this.expirationSeconds * 1000);
        this._mem.set(key, new CacheEntry(data, expiration));
        return data;
    }
}