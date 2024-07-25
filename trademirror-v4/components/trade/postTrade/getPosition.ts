import Web3 from 'web3'
import { type AbiItem } from 'web3-utils'
import pkg from 'web3'
const { providers } = pkg

interface Position {
  positionHash: string
  pair: string
  pairBase: string
  marginToken: string
  isLong: boolean
  margin: string
  qty: string
  entryPrice: string
  stopLoss: string
  takeProfit: string
  openFee: string
  executionFee: string
  fundingFee: string
  timestamp: string
  holdingFee: string
}

const providerUrl = process.env.OPBNB_RPC_URL_ALT as string
//const providerUrl = 'https://opbnb-mainnet-rpc.bnbchain.org' // opBNB mainnet
const web3 = new Web3(new providers.HttpProvider(providerUrl))

// ABI of the getPositionByHashV2 function
const getPositionByHashV2Abi: AbiItem[] = [
  {
    inputs: [{ internalType: 'bytes32', name: 'tradeHash', type: 'bytes32' }],
    name: 'getPositionByHashV2',
    outputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'positionHash', type: 'bytes32' },
          { internalType: 'string', name: 'pair', type: 'string' },
          { internalType: 'address', name: 'pairBase', type: 'address' },
          { internalType: 'address', name: 'marginToken', type: 'address' },
          { internalType: 'bool', name: 'isLong', type: 'bool' },
          { internalType: 'uint96', name: 'margin', type: 'uint96' },
          { internalType: 'uint80', name: 'qty', type: 'uint80' },
          { internalType: 'uint64', name: 'entryPrice', type: 'uint64' },
          { internalType: 'uint64', name: 'stopLoss', type: 'uint64' },
          { internalType: 'uint64', name: 'takeProfit', type: 'uint64' },
          { internalType: 'uint96', name: 'openFee', type: 'uint96' },
          { internalType: 'uint96', name: 'executionFee', type: 'uint96' },
          { internalType: 'int256', name: 'fundingFee', type: 'int256' },
          { internalType: 'uint40', name: 'timestamp', type: 'uint40' },
          { internalType: 'uint96', name: 'holdingFee', type: 'uint96' },
        ],
        internalType: 'struct ITradingReader.Position',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

// Address of the ApolloX Finance contract
const contractAddress = process.env.APOLLOX_CONTRACT_OPBNB as string

// Create contract instance
const contract = new web3.eth.Contract(getPositionByHashV2Abi, contractAddress)

export async function getEntryPrice(tradeHash: string): Promise<Position> {
  const interval = 4000 // Poll every 4 seconds
  const timeout = 240000 // Timeout after 240 seconds (4 min)

  const startTime = Date.now()

  async function pollForEntryPrice(): Promise<Position> {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for entry price to be confirmed')
    }

    try {
      const position: Position = await contract.methods
        .getPositionByHashV2(tradeHash)
        .call()
      const entryPrice = position.entryPrice

      if (Number(entryPrice) > 0) {
        const confirmedEntryPrice = (Number(entryPrice) / 1e8).toString() // Adjust the scale if necessary
        console.log('Confirmed Entry Price:', confirmedEntryPrice)
        return position
      } else {
        console.error('Entry price not yet confirmed, retrying...')
        await new Promise((res) => setTimeout(res, interval)) // Wait for the next poll
        return pollForEntryPrice()
      }
    } catch (error) {
      console.error('Error fetching entry price:', error)
      throw error
    }
  }

  return pollForEntryPrice()
}
