import Web3 from 'web3'
import type { TransactionReceipt } from 'web3'
import pkg from 'web3'
const { providers } = pkg

const providerUrl = process.env.OPBNB_RPC_URL as string
//const providerUrl = 'https://opbnb-mainnet-rpc.bnbchain.org' // opBNB mainnet
const web3 = new Web3(new providers.HttpProvider(providerUrl))

//const web3 = new Web3('https://opbnb-mainnet-rpc.bnbchain.org')

const targetTopic0 =
  '0x7064b82c073f138da0ec7646ebb51d4a0061d647accb4670bc564edf0bfac41d'

export function getTradeHashFromReceipt(receipt: TransactionReceipt): string | null {
  for (const log of receipt.logs) {
    // Check if log.topics exists and the log matches the specific topic
    if (log.topics && log.topics[0] === targetTopic0) {
      if (log.topics.length > 2) {
        console.log('Found event with target topics[0]. topics[2]:', log.topics[2])
        return web3.utils.bytesToHex(log.topics[2])
      } else {
        console.log('Found event with target topics[0], but no topics[2] found.')
      }
    }
  }
  return null
}
