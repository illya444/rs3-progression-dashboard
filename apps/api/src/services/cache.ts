import { Socket } from "node:net";
import { config } from "../config/config.js";

type CacheValue = unknown;

interface CacheService {
  get<T = CacheValue>(key: string): Promise<T | null>;
  set<T = CacheValue>(key: string, value: T, ttlSeconds: number): Promise<void>;
}

type MemoryEntry = {
  value: string;
  expiresAt: number;
};

class MemoryCacheService implements CacheService {
  private readonly store = new Map<string, MemoryEntry>();

  async get<T = CacheValue>(key: string): Promise<T | null> {
    const hit = this.store.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return JSON.parse(hit.value) as T;
  }

  async set<T = CacheValue>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value: JSON.stringify(value),
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }
}

class RedisCacheService implements CacheService {
  constructor(private readonly redisUrl: string) {}

  async get<T = CacheValue>(key: string): Promise<T | null> {
    const reply = await this.sendCommand(["GET", key]);
    if (reply === null) return null;
    return JSON.parse(reply) as T;
  }

  async set<T = CacheValue>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.sendCommand(["SET", key, JSON.stringify(value), "EX", String(ttlSeconds)]);
  }

  private sendCommand(parts: string[]): Promise<string | null> {
    const url = new URL(this.redisUrl);
    const host = url.hostname;
    const port = Number(url.port || 6379);
    const dbIndex = url.pathname && url.pathname !== "/" ? Number(url.pathname.slice(1)) : 0;
    const password = url.password ? decodeURIComponent(url.password) : "";
    const username = url.username ? decodeURIComponent(url.username) : "";

    const commands: string[][] = [];
    if (password) {
      commands.push(username ? ["AUTH", username, password] : ["AUTH", password]);
    }
    if (!Number.isNaN(dbIndex) && dbIndex > 0) {
      commands.push(["SELECT", String(dbIndex)]);
    }
    commands.push(parts);

    return new Promise((resolve, reject) => {
      const socket = new Socket();
      const chunks: Buffer[] = [];

      socket.setTimeout(2500);
      socket.connect(port, host, () => {
        for (const command of commands) {
          socket.write(this.encode(command));
        }
      });

      socket.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
        const text = Buffer.concat(chunks).toString("utf8");
        const lines = text.split("\r\n");
        const completeReplies = lines.filter((line) => line.startsWith("+") || line.startsWith("-") || line.startsWith("$"));
        if (completeReplies.length >= commands.length) {
          socket.end();
          try {
            const last = completeReplies[completeReplies.length - 1];
            resolve(this.parseReply(last, text));
          } catch (error) {
            reject(error);
          }
        }
      });

      socket.on("timeout", () => {
        socket.destroy(new Error("Redis timeout"));
      });

      socket.on("error", (error) => {
        reject(error);
      });

      socket.on("close", () => {
        if (chunks.length === 0) {
          reject(new Error("Redis closed before reply"));
        }
      });
    });
  }

  private parseReply(lastHeader: string, fullText: string): string | null {
    if (lastHeader.startsWith("-")) {
      throw new Error(`Redis error reply: ${lastHeader}`);
    }

    if (lastHeader === "$-1") {
      return null;
    }

    if (lastHeader.startsWith("$")) {
      const parts = fullText.split("\r\n");
      const index = parts.findIndex((p) => p === lastHeader);
      const payload = index >= 0 ? parts[index + 1] : "";
      return payload ?? "";
    }

    if (lastHeader.startsWith("+")) {
      return lastHeader.slice(1);
    }

    return null;
  }

  private encode(parts: string[]): string {
    const head = `*${parts.length}\r\n`;
    const body = parts.map((part) => `$${Buffer.byteLength(part)}\r\n${part}\r\n`).join("");
    return head + body;
  }
}

const memoryFallback = new MemoryCacheService();

function createCacheService(): CacheService {
  if (!config.redisUrl) {
    return memoryFallback;
  }

  const redis = new RedisCacheService(config.redisUrl);
  return {
    async get<T = CacheValue>(key: string): Promise<T | null> {
      try {
        return await redis.get<T>(key);
      } catch {
        return memoryFallback.get<T>(key);
      }
    },
    async set<T = CacheValue>(key: string, value: T, ttlSeconds: number): Promise<void> {
      try {
        await redis.set<T>(key, value, ttlSeconds);
      } catch {
        await memoryFallback.set<T>(key, value, ttlSeconds);
      }
    }
  };
}

export const cache = createCacheService();
