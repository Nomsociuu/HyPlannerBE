const redis = require("redis");

// ✅ Redis client configuration
const REDIS_ENABLED = process.env.REDIS_ENABLED === "true";

let client = null;

if (REDIS_ENABLED) {
  client = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error("❌ Redis: Too many retry attempts, giving up");
          return new Error("Redis connection failed");
        }
        // Exponential backoff: 50ms, 100ms, 200ms, 400ms, 800ms, 1600ms...
        return Math.min(retries * 50, 3000);
      },
    },
  });

  client.on("error", (err) => {
    console.error("❌ Redis Client Error:", err.message);
  });

  client.on("connect", () => {
    console.log("✅ Redis Client Connected");
  });

  client.on("ready", () => {
    console.log("✅ Redis Client Ready");
  });

  client.on("end", () => {
    console.log("⚠️ Redis Client Disconnected");
  });

  // Connect to Redis
  (async () => {
    try {
      await client.connect();
    } catch (error) {
      console.error("❌ Failed to connect to Redis:", error.message);
      console.log("⚠️ App will continue without caching");
    }
  })();
} else {
  console.log(
    "ℹ️ Redis is disabled (set REDIS_ENABLED=true in .env to enable)"
  );
}

module.exports = client;
