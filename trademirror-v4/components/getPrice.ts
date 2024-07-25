import Redis from 'ioredis'
import axios from 'axios'

const redisServer = process.env.REDIS_SERVER ?? 'redis://@localhost:6379'
// Create Redis client
const redis = new Redis(redisServer)
// API URL
const apiUrl = 'https://www.apollox.finance/fapi/v1/assetIndex'

// fetch data and save to Redis
async function fetchAndStoreData() {
  try {
    const response = await axios.get(apiUrl)
    const data = response.data
    await redis.call('JSON.SET', 'assetIndex', '.', JSON.stringify(data))
    //console.log('AssetIndex fetched and stored successfully.')
  } catch (error) {
    console.error('Error fetching or storing data:', error)
  }
}

export async function startPolling() {
  console.log('Starting polling every 5 seconds.')
  fetchAndStoreData() // Initial call
  setInterval(fetchAndStoreData, 5000) // Call every 5 seconds

  // Exit on SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('Exiting...')
    await redis.quit()
    process.exit()
  })
}

// Start polling when script is executed
startPolling()
