import Web3 from 'web3'

import { performance } from 'perf_hooks'
import { IpcProvider } from 'web3-providers-ipc'

const web3 = new Web3(
  new IpcProvider('/home/fullnode/chaindata/snapshot/geth.pbss/geth/geth.ipc')
)

// minimal ABI for symbol method
const minABI = [
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    type: 'function',
  },
]

// get token symbol
export const getTokenSymbol = async (address: any) => {
  // ignore openTradeBNB methods (0x)
  if (address === '0x0000000000000000000000000000000000000000') {
    console.log('Zero address')
    return 'BNB'
  }
  const contract = new web3.eth.Contract(minABI, address)

  try {
    const start = performance.now()
    // fetch token symbol
    const symbol = await contract.methods.symbol().call()
    const end = performance.now()
    const responseTime = (end - start).toFixed(2)

    const yellow = '\x1b[33m'
    const reset = '\x1b[0m'

    console.log(
      `Token Symbol: ${symbol} - - RPC Response Time: ${yellow}${responseTime} ms${reset}`
    )
    return symbol
  } catch (error) {
    console.error('Error fetching token symbol:', error)
    return 'not found'
  }
}

getTokenSymbol('0x55d398326f99059fF775485246999027B3197955')
