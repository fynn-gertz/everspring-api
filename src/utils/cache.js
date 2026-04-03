import { logger } from './logger.js';

class Cache {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttlMs = 600000) {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });
    logger.info(`Cache SET: ${key} (TTL: ${ttlMs}ms)`);
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      logger.info(`Cache EXPIRED: ${key}`);
      return null;
    }

    logger.info(`Cache HIT: ${key}`);
    return item.value;
  }
}

export const cache = new Cache();

export const TTL = {
  CATALOG: 10 * 60 * 1000,
  PRODUCT: 10 * 60 * 1000,
  ORDER_STATUS: 5 * 60 * 1000,
  TRACKING: 5 * 60 * 1000
};
