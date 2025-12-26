const redis = require("redis");

// ✅ SERVERLESS OPTIMIZATION: Cache Redis connection
const REDIS_ENABLED = process.env.REDIS_ENABLED === "true";

let cachedClient = null;
let connectingPromise = null;

// Lazy connection function for serverless
const getRedisClient = async () => {
  if (!REDIS_ENABLED) {
    return null;
  }

  // Return cached client if connected
  if (cachedClient && cachedClient.isOpen) {
    return cachedClient;
  }

  // If already connecting, wait for that promise
  if (connectingPromise) {
    return connectingPromise;
  }

  // Start new connection
  connectingPromise = (async () => {
    try {
      const client = redis.createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 5) {
              console.error("❌ Redis: Too many retry attempts");
              return false; // Stop retrying
            }
            return Math.min(retries * 100, 3000);
          },
          connectTimeout: 5000, // 5s timeout for serverless
        },
      });

      client.on("error", (err) => {
        console.error("❌ Redis Error:", err.message);
        cachedClient = null;
      });

      await client.connect();
      console.log("✅ Redis Connected");
      cachedClient = client;
      connectingPromise = null;
      return client;
    } catch (error) {
      console.error("❌ Redis connection failed:", error.message);
      console.log("⚠️ Continuing without cache");
      connectingPromise = null;
      cachedClient = null;
      return null;
    }
  })();

  return connectingPromise;
};

// For backward compatibility - returns client synchronously (may be null)
const client = {
  get isReady() {
    return cachedClient?.isOpen || false;
  },
  // Async getter for proper serverless usage
  async getClient() {
    return await getRedisClient();
  },
  // Proxy methods for backward compatibility
  async get(key) {
    const c = await getRedisClient();
    return c ? c.get(key) : null;
  },
  async set(key, value, options) {
    const c = await getRedisClient();
    return c ? c.set(key, value, options) : null;
  },
  async del(key) {
    const c = await getRedisClient();
    return c ? c.del(key) : null;
  },
  async setEx(key, seconds, value) {
    const c = await getRedisClient();
    return c ? c.setEx(key, seconds, value) : null;
  },
};

if (!REDIS_ENABLED) {
  console.log("ℹ️ Redis is disabled (set REDIS_ENABLED=true to enable)");
}

module.exports = client;
