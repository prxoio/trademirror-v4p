import Redis from 'ioredis';

const redisServer = process.env.REDIS_SERVER ?? 'redis://localhost:6379';
// Create a Redis client
const redis = new Redis(redisServer);

export async function getPriceIndex(asset: string): Promise<number | null> {
  try {
    const result = await redis.call('JSON.GET', 'assetIndex', `$.[?(@.symbol=="${asset}")]`);
    
    if (result) {
      const data = JSON.parse(String(result));
      if (Array.isArray(data) && data.length > 0 && data[0].index) {
        return parseFloat(data[0].index);
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching data from Redis:', error);
    return null;
  }
}