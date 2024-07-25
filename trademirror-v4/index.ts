import Redis from 'ioredis'

import { parseInputData } from './components/decodeTx'
import { convertToHumanReadable } from './components/convertNumbers'
import { startPolling } from './components/getPrice'
import { startTrade } from './components/trade/startTrade'
import { convertNumbersToStrings } from './components/utils/convertNumbers'
import { showLogo } from '@components/logo'
//show logo at startup
showLogo()
// AssetIndex WSS - store in Redis
startPolling().catch((error) => {
  console.error('Error starting WebSocket:', error)
})
const redisServer = process.env.REDIS_SERVER ?? 'redis://@localhost:6379'
// Redis client for subscribing to keyspace notifications
const subscriber = new Redis(redisServer)
// Another Redis client for commands
const commandClient = new Redis(redisServer)
// Subscribe to keyspace notifications for all keys
const keyspaceChannel = '__keyspace@0__:*'
subscriber.psubscribe(keyspaceChannel, (err, count) => {
  if (err) {
    console.error('Failed to psubscribe: %s', err.message)
  } else {
    console.log(
      `Subscribed successfully! This client is currently subscribed to ${count} channels.`
    )
  }
})
// Listen for msgs
subscriber.on('pmessage', async (pattern, channel, message) => {
  //console.log(`Received event ${message} for ${channel}`)

  if (typeof message === 'string' && message === 'json.set') {
    const key = channel.slice(channel.indexOf(':') + 1)
    if (key && key.startsWith('tx:')) {
      try {
        const value = await commandClient.call('JSON.GET', key)
        // console.log(`Key ${key} was set with JSON value: ${value}`)
        // if key starts with 'tx:', call handleTx(value)
        if (key.startsWith('tx:')) {
          handleTx(value)
        }
      } catch (err: any) {
        console.error('Failed to get JSON value: %s', err.message)
      }
    }
  }
})
// Handle errors
subscriber.on('error', (err) => {
  console.error('Redis error:', err)
})

commandClient.on('error', (err) => {
  console.error('Redis command client error:', err)
})

async function handleTx(transaction: any) {
  const tx = JSON.parse(transaction)

  if (tx.input) {
    const decodedTx = parseInputData(tx.input)
    const newtx = convertNumbersToStrings(decodedTx.decodedInput)

    console.log('Decoded transaction:', newtx)

    let converted
    if (
      decodedTx.methodSignature &&
      decodedTx.methodSignature.includes('openMarketTrade')
    ) {
      converted = await convertToHumanReadable(newtx.data)
      console.log('Converted transaction:', converted)

      // Save transaction to Redis including decoded, human readable, and timestamp
      try {
        const redisData = {
          ...tx,
          decoded: newtx,
          decodedReadable: converted,
          timestamp: Date.now(),
        }
        await commandClient.call(
          'JSON.SET',
          `trades:${tx.hash}`,
          '.',
          JSON.stringify(redisData)
        )
        console.log(`Transaction ${tx.hash} saved to Redis.`)

        if (redisData.blockNumber === null) {
          startTrade(redisData)
        }
      } catch (err: any) {
        console.error('Failed to save transaction to Redis: %s', err.message)
      }
    }
  }
}
