import { Redis } from 'ioredis';

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
}

class CacheService {
  private redis: Redis | null = null;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
    this.initializeRedis();
  }

  private initializeRedis(): void {
    try {
      this.redis = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.db || 0,
        maxRetriesPerRequest: this.config.maxRetriesPerRequest || 3,
        lazyConnect: true,
      });

      this.redis.on('error', (error) => {
        console.error('Redis connection error:', error);
        this.redis = null;
      });

      this.redis.on('connect', () => {
        console.log('Redis connected successfully');
      });
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.redis = null;
    }
  }

  private isConnected(): boolean {
    return this.redis !== null && this.redis.status === 'ready';
  }

  /**
   * Set a key-value pair with optional expiration
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.isConnected()) {
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.redis!.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.redis!.set(key, serializedValue);
      }
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Get a value by key
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isConnected()) {
      return null;
    }

    try {
      const value = await this.redis!.get(key);
      
      if (value === null) {
        return null;
      }
      
      return JSON.parse(value);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete a key
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isConnected()) {
      return false;
    }

    try {
      const result = await this.redis!.del(key);
      return result > 0;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isConnected()) {
      return false;
    }

    try {
      const result = await this.redis!.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Set expiration for a key
   */
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.isConnected()) {
      return false;
    }

    try {
      const result = await this.redis!.expire(key, ttlSeconds);
      return result === 1;
    } catch (error) {
      console.error('Cache expire error:', error);
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  async ttl(key: string): Promise<number> {
    if (!this.isConnected()) {
      return -1;
    }

    try {
      return await this.redis!.ttl(key);
    } catch (error) {
      console.error('Cache ttl error:', error);
      return -1;
    }
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, amount: number = 1): Promise<number | null> {
    if (!this.isConnected()) {
      return null;
    }

    try {
      return await this.redis!.incrby(key, amount);
    } catch (error) {
      console.error('Cache increment error:', error);
      return null;
    }
  }

  /**
   * Decrement a numeric value
   */
  async decrement(key: string, amount: number = 1): Promise<number | null> {
    if (!this.isConnected()) {
      return null;
    }

    try {
      return await this.redis!.decrby(key, amount);
    } catch (error) {
      console.error('Cache decrement error:', error);
      return null;
    }
  }

  /**
   * Get multiple keys at once
   */
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    if (!this.isConnected()) {
      return keys.map(() => null);
    }

    try {
      const values = await this.redis!.mget(...keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple key-value pairs at once
   */
  async mset(keyValuePairs: Record<string, any>): Promise<boolean> {
    if (!this.isConnected()) {
      return false;
    }

    try {
      const serializedPairs: string[] = [];
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        serializedPairs.push(key, JSON.stringify(value));
      }
      
      await this.redis!.mset(...serializedPairs);
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    if (!this.isConnected()) {
      return false;
    }

    try {
      await this.redis!.flushdb();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    memory: string;
    keys: number;
    uptime: number;
  }> {
    if (!this.isConnected()) {
      return {
        connected: false,
        memory: '0B',
        keys: 0,
        uptime: 0,
      };
    }

    try {
      const info = await this.redis!.info('memory');
      const keys = await this.redis!.dbsize();
      
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memory = memoryMatch ? memoryMatch[1] : '0B';
      
      return {
        connected: true,
        memory,
        keys,
        uptime: 0, // Would need to parse more info for uptime
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        connected: false,
        memory: '0B',
        keys: 0,
        uptime: 0,
      };
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }
}

// Initialize cache service
const cacheService = new CacheService({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
});

export default cacheService;

// Cache key generators
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userBalance: (id: string) => `user:${id}:balance`,
  userDeposits: (id: string) => `user:${id}:deposits`,
  userWithdrawals: (id: string) => `user:${id}:withdrawals`,
  dailyReward: (id: string, date: string) => `daily_reward:${id}:${date}`,
  randomReward: (id: string, date: string) => `random_reward:${id}:${date}`,
  referralStats: (id: string) => `referral_stats:${id}`,
  policies: () => 'policies:all',
  performanceMetrics: (period: string) => `performance:${period}`,
  systemAlerts: () => 'system:alerts',
};
