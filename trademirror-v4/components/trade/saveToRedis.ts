import Redis from 'ioredis'

const redisServer = process.env.REDIS_SERVER ?? 'redis://@localhost:6379'

const commandClient = new Redis(redisServer)

// convert BigInt values to strings in an object - cant store BigInt in JSON
function convertBigIntToString(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString()
  } else if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString)
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertBigIntToString(value)])
    )
  } else {
    return obj
  }
}

export async function saveToRedis(data: any, path: string) {
  const saveData = convertBigIntToString(data)

  // save transaction to Redis
  try {
    const redisData = {
      ...saveData,
      timestamp: Date.now(),
    }
    await commandClient.call('JSON.SET', `${path}`, '.', JSON.stringify(redisData))
    console.log(`Transaction ${path} saved to Redis.`)
  } catch (err: any) {
    console.error('Failed to save transaction to Redis: %s', err.message)
  }
}
