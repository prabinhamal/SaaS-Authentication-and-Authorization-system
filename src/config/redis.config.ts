import { createClient, RedisClientType } from "redis";

/// create redis client

export const redisClient: RedisClientType = createClient({
  url: "redis://localhost:6379",
  socket: {
    keepAlive: true,
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

redisClient.on("connect", () => {
  console.log("Redis Connecting....");
});

redisClient.on("ready", () => {
  console.log("Redis is Ready.");
});

redisClient.on("end", () => {
  console.log("Redis connection ended.");
});

redisClient.on("error", (error) => {
  console.log("\n---------------- Redis Error ------------- ");
  console.log("Message: ", error?.message);
  console.log("code: ", error?.code);
  console.log("============== End Redis Error ============ ");
});

process.on("SIGINT", async () => {
  await redisClient.quit();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await redisClient.quit();
  process.exit(0);
});

//// return redis clinet.
export async function connectRedis(): Promise<RedisClientType> {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
}
