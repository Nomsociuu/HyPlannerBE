const client = require("../config/redis");

/**
 * ✅ Redis Cache Middleware
 * Caches GET requests for specified duration
 * @param {number} duration - Cache duration in seconds (default: 3600 = 1 hour)
 */
const cache = (duration = 3600) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Skip caching if Redis is not connected or null
    if (!client || !client.isOpen) {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // Try to get cached data
      const cachedData = await client.get(key);

      if (cachedData) {
        console.log(`✅ Cache HIT: ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`❌ Cache MISS: ${key}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (data) => {
        // Cache the response data
        client
          .setEx(key, duration, JSON.stringify(data))
          .then(() => {
            console.log(`💾 Cached: ${key} (TTL: ${duration}s)`);
          })
          .catch((err) => {
            console.error(`❌ Cache SET error: ${err.message}`);
          });

        // Send response to client
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("❌ Cache middleware error:", error.message);
      // Continue without caching on error
      next();
    }
  };
};

/**
 * Clear cache by pattern
 * @param {string} pattern - Redis key pattern (e.g., "cache:/api/styles*")
 */
const clearCache = async (pattern) => {
  try {
    if (!client || !client.isOpen) {
      console.warn("⚠️ Redis not connected, cannot clear cache");
      return;
    }

    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(
        `🗑️ Cleared ${keys.length} cache entries matching: ${pattern}`
      );
    }
  } catch (error) {
    console.error("❌ Clear cache error:", error.message);
  }
};

/**
 * Clear all cache
 */
const clearAllCache = async () => {
  try {
    if (!client || !client.isOpen) {
      console.warn("⚠️ Redis not connected, cannot clear cache");
      return;
    }

    await client.flushAll();
    console.log("🗑️ Cleared all cache");
  } catch (error) {
    console.error("❌ Clear all cache error:", error.message);
  }
};

module.exports = { cache, clearCache, clearAllCache };
