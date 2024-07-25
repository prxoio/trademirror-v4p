import Web3, { type Numbers } from 'web3'
import pkg from 'web3'
const { providers } = pkg
import { BigNumber } from 'bignumber.js'
import { saveToRedis } from './saveToRedis'
import { getPriceIndex } from '../getRedisAssetIndex'
import { getTradeHashFromReceipt } from './postTrade/decodeLogs'
import { getEntryPrice } from './postTrade/getPosition'
import { updateTradeTp } from './postTrade/updateTp'
import { convertToWei } from '@utils/convertToWei'
import { calculateQuantity } from '@utils/calculateQty'
import { calculateTakeProfitPrice, calculateTpSl } from '@utils/calculateTp'
import { contractABI, ERC20_ABI } from '@utils/functionAbis'
import { type Transaction } from '@utils/interfaces'
import { updateTradeTpAndSl } from './postTrade/updateTpAndSl'

const providerUrl = process.env.OPBNB_RPC_URL as string
const web3 = new Web3(new providers.HttpProvider(providerUrl))
// apollox contact address for opBNB
const contractAddress = process.env.APOLLOX_CONTRACT_OPBNB as string
// USDT token contract address on opBNB
const USDT_ADDRESS = '0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3'
//const BNB_ADDRESS = '0x0000000000000000000000000000000000000000'
const BTC_ADDRESS = '0xBAd4ccc91EF0dfFfbCAb1402C519601fbAf244EF'
const BNB_ADDRESS = '0x4200000000000000000000000000000000000006'

const usdtContract = new web3.eth.Contract(ERC20_ABI, USDT_ADDRESS)

async function handleAmountIn() {
  const totalBalance = await getUSDTBalance(
    '0x03dB6C5cd175b6e159D6Dd7aa56822059f5ce617'
  )
  // % of totalBalance
  const percent = 0.022
  const amountIn = Number(totalBalance) * percent
  console.log(`Using ${percent}% of Total Balance: `, amountIn.toFixed(2), 'USDT')

  return amountIn
}

async function getUSDTBalance(address: string) {
  try {
    const balance = (await usdtContract.methods.balanceOf(address).call()) as Numbers

    const balanceUSDT = web3.utils.fromWei(balance, 'ether')

    console.log(`Balance of ${address}: ${balanceUSDT} USDT`)
    return balanceUSDT
  } catch (error) {
    console.error(`Failed to get USDT balance for address ${address}:`, error)
    throw error
  }
}
async function myAmounts(tokenInPrice: string, lev: number, token: string) {
  if (token === 'BNB') {
    const myAmountIn = await handleAmountIn()
    const myAmountInWei = convertToWei(myAmountIn, 18)
    const amountInUSD = Number(myAmountIn) * Number(tokenInPrice)
    return { myAmountInWei, amountInUSD }
  } else if (token === 'USDT') {
    const myAmountIn = await handleAmountIn()
    const myAmountInWei = convertToWei(myAmountIn, 18)
    const amountInUSD = Number(myAmountIn)
    return { myAmountInWei, amountInUSD }
  }
}

export async function processTransaction(
  transaction: Transaction,
  lev: number,
  token: string,
  baseToken: string,
  takeProfitPercent: number,
  stopLossPercent: number
) {
  const { from, decodedReadable } = transaction

  if (!decodedReadable) {
    throw new Error('decodedReadable is required.')
  }

  const {
    pairBase,
    isLong,
    tokenIn,
    amountIn,
    qty,
    price,
    stopLoss,
    takeProfit,
    broker,
    leverage,
    totalValue,
    tokenInPrice,
  } = decodedReadable

  const amountInWei = convertToWei(amountIn, 18)
  const priceNormalized = new BigNumber(Number(price) * 1e8).toFixed(0)
  const qtyNormalized = calculateQuantity(totalValue, price)
  const stopLossNormalized = new BigNumber(Number(stopLoss) * 1e8).toFixed(0)
  const takeProfitNormalized = new BigNumber(Number(takeProfit) * 1e8).toFixed(0)

  const amounts = await myAmounts(tokenInPrice, lev, token)

  const myAmountInWei = amounts?.myAmountInWei
  const myAmountInUSD = amounts?.amountInUSD
  const myTotalValue = (amounts?.amountInUSD ?? 0) * lev
  const myQtyNormalized = calculateQuantity(myTotalValue, price)

  const assetIndex = await getPriceIndex('BTCUSD')
  console.log('assetIndex:', assetIndex)
  const myTakeProfit = Number(assetIndex) * 1.0
  const myTakeProfitNormalized = new BigNumber(Number(myTakeProfit) * 1e8).toFixed(0)

  console.log('price:', price)
  console.log('priceNormalized:', priceNormalized)
  console.log('takeProfit:', myTakeProfit)
  console.log('takeProfitNormalized:', myTakeProfitNormalized)

  const inputData = {
    pairBase: baseToken, //pairBase
    isLong,
    tokenIn: USDT_ADDRESS, //tokenIn
    amountIn: myAmountInWei,
    qty: myQtyNormalized,
    price: priceNormalized,
    stopLoss: stopLossNormalized,
    takeProfit: myTakeProfitNormalized,
    broker,
  }
  console.log('Input data:', inputData)

  const account = process.env.ACCOUNT_ADDRESS as string
  const privateKey = process.env.PRIVATE_KEY as string

  const contract = new web3.eth.Contract(contractABI, contractAddress)

  async function debugTransaction() {
    try {
      const result = await contract.methods
        .openMarketTrade(inputData)
        .call({ from: account })
      console.log('Transaction call result:', result)
    } catch (error) {
      console.error('Error during call:', error)
    }
  }

  const txData = contract.methods.openMarketTrade(inputData).encodeABI()

  console.log('Transaction data:', txData)
  await debugTransaction() // debug transaction before sending

  try {
    const nonce = await web3.eth.getTransactionCount(account, 'latest')
    const gasPrice = await web3.eth.getGasPrice()
    const gasLimit = 2000000 //  web3.eth.estimateGas ??

    const tx = {
      from: account,
      to: contractAddress,
      gas: gasLimit,
      gasPrice: gasPrice,
      nonce: nonce,
      data: txData,
    }
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey)
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    console.log('Transaction receipt:', receipt)

    const tradeHash = getTradeHashFromReceipt(receipt) as string
    console.log('TradeHash:', tradeHash)

    const confirmedPosition = await getEntryPrice(tradeHash)
    const confirmedEntryPrice = Number(confirmedPosition.entryPrice) / 1e8
    console.log('Confirmed Entry Price:', confirmedEntryPrice)

    /*     const calculateTp = calculateTakeProfitPrice(
      Number(myAmountInUSD), //initialMargin USD
      lev, //leverage,
      confirmedEntryPrice, //btcBuyPrice,
      takeProfitPercent
    )
 */
    const getTakeProfitPrice = calculateTakeProfitPrice(
      Number(myAmountInUSD), //initialMargin USD
      lev, //leverage,
      confirmedEntryPrice, //btcBuyPrice,
      takeProfitPercent,
      isLong
    )

    const takeProfitPrice = Math.floor(getTakeProfitPrice * 1e8) // convert to uint64
    //const stopLossPrice = Math.floor(calculateTpSlPrice.stopLossPrice * 1e8) // convert to uint64

    const updateTpReceipt = await updateTradeTp({
      tradeHash,
      takeProfitPrice,
    })
      .then((receipt) => {
        console.error(
          `UpdateTpAndSl for Trade ${tradeHash} was successful with txhash:`,
          receipt.transactionHash
        )
      })
      .catch((error) => {
        console.error('Error sending UpdateTpSl transaction:', error)
      })

    const timestamp = Date.now()
    // save transaction to Redis
    const redisData = {
      decodedReadable: {
        ...decodedReadable,
        myAmountInWei,
        myTotalValue,
        myQtyNormalized,
        myTakeProfit,
        myTakeProfitNormalized,
      },
      timestamp: timestamp,
      transaction: tx,
      receipt,
      originalTx: transaction,
      confirmedPositionReceipt: confirmedPosition,
      confirmedEntryPrice: confirmedEntryPrice,
      takeProfitPrice: takeProfitPrice,
      updateTpReceipt: updateTpReceipt,
    }

    await saveToRedis(redisData, `mytrades:trade:${timestamp}`)
  } catch (error) {
    console.error('Error sending transaction:', error)
  }
}

/*  // Example usage
const transaction = {
  from: 'account_address',
  decodedReadable: {
    pairBase: '0xBAd4ccc91EF0dfFfbCAb1402C519601fbAf244EF',
    isLong: true,
    tokenIn: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3',
    amountIn: '0.0041',
    qty: '0.0292265706',
    price: '65376.88205939',
    stopLoss: '0',
    takeProfit: '66180.20000000',
    broker: '2',
    totalValue: '1946.11',
    leverage: '786.63',
    tokenInPrice: '603.40666',
    tokenInSymbol: 'BNBUSD',
    baseSymbol: '500BTCUSD',
  },
}

processTransaction(transaction, 850, 'USDT', 110)
// tx object
// leverage 250-1000x
// token BNB or USDT
// take profit ( 2 is 200% etc )
   */
