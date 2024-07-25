
// OPEN MARKET TRADE ABI FUNCTION
export const contractABI = [
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'pairBase', type: 'address' },
          { internalType: 'bool', name: 'isLong', type: 'bool' },
          { internalType: 'address', name: 'tokenIn', type: 'address' },
          { internalType: 'uint96', name: 'amountIn', type: 'uint96' },
          { internalType: 'uint80', name: 'qty', type: 'uint80' },
          { internalType: 'uint64', name: 'price', type: 'uint64' },
          { internalType: 'uint64', name: 'stopLoss', type: 'uint64' },
          { internalType: 'uint64', name: 'takeProfit', type: 'uint64' },
          { internalType: 'uint24', name: 'broker', type: 'uint24' },
        ],
        internalType: 'struct IBook.OpenDataInput',
        name: 'data',
        type: 'tuple',
      },
    ],
    name: 'openMarketTrade',
    outputs: [{ internalType: 'bytes32', name: 'tradeHash', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export const ERC20_ABI = [
  // balanceOf
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    type: 'function',
  },
]

// UPDATE TRADE TAKE PROFIT - ABI FUNCTION
import { type AbiItem } from 'web3-utils'
export const updateTradeTpAbi: AbiItem[] = [
  {
    inputs: [
      { internalType: 'bytes32', name: 'tradeHash', type: 'bytes32' },
      { internalType: 'uint64', name: 'takeProfit', type: 'uint64' },
    ],
    name: 'updateTradeTp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

// UPDATE TRADE TAKE PROFIT AND STOP LOSS - ABI FUNCTION
export const updateTradeTpAndSlAbi: AbiItem[] = [
  {
    inputs: [
      { internalType: 'bytes32', name: 'tradeHash', type: 'bytes32' },
      { internalType: 'uint64', name: 'takeProfit', type: 'uint64' },
      { internalType: 'uint64', name: 'stopLoss', type: 'uint64' },
    ],
    name: 'updateTradeTpAndSl',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]