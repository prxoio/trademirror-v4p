import { getPriceIndex } from './getRedisAssetIndex'
import { getTokenSymbol } from './getSymbol'
import {
  type OpenDataInput,
  type HumanReadableOpenDataInput,
} from '@utils/interfaces'

async function getPairPrice(address: string) {
  const pair = await getSymbolFromAddress(address)
  const price = await getPriceIndex(pair)
  console.log('Price:', price)

  if (pair === 'USDTUSD') {
    return 1
  }
  return price
}

async function getSymbolFromAddress(address: string) {
  const symbol = await getTokenSymbol(address)
  const pair = symbol + 'USD'
  console.log('Pair:', pair)
  return pair
}

export async function convertToHumanReadable(
  input: OpenDataInput
): Promise<HumanReadableOpenDataInput> {
  const decimals = {
    amountIn: 18,
    qty: 10,
    price: 8,
    stopLoss: 8,
    takeProfit: 8,
  }

  function convert(value: string, decimal: number): string {
    const factor = Math.pow(10, decimal)
    return (parseInt(value) / factor).toFixed(decimal)
  }

  const amountIn = parseInt(input.amountIn) / Math.pow(10, decimals.amountIn)
  const qty = parseInt(input.qty) / Math.pow(10, decimals.qty)
  const price = parseInt(input.price) / Math.pow(10, decimals.price)
  const totalValue = qty * price
  const tokenInUSD = await getPairPrice(input.tokenIn)
  const amountInUSD = amountIn * (tokenInUSD ?? 0)

  const leverage = (totalValue / amountInUSD).toFixed(2)

  return {
    pairBase: input.pairBase,
    isLong: input.isLong,
    tokenIn: input.tokenIn,
    amountIn: amountIn.toString(),
    qty: qty.toString(),
    price: price.toString(),
    stopLoss: convert(input.stopLoss, decimals.stopLoss),
    takeProfit: convert(input.takeProfit, decimals.takeProfit),
    broker: input.broker,
    totalValue: totalValue.toFixed(2),
    leverage: leverage,
    tokenInPrice: tokenInUSD?.toString(),
    tokenInSymbol: await getSymbolFromAddress(input.tokenIn),
    baseSymbol: await getSymbolFromAddress(input.pairBase),
  }
}

/* // testing
const decodedTransaction: OpenDataInput = {
  pairBase: '0xBAd4ccc91EF0dfFfbCAb1402C519601fbAf244EF',
  isLong: true,
  tokenIn: '0x0000000000000000000000000000000000000000',
  amountIn: '100000000000000',
  qty: '7579540',
  price: '6843631566526',
  stopLoss: '0',
  takeProfit: '6792810000000',
  broker: '1',
}

;(async () => {
  const humanReadableTransaction = await convertToHumanReadable(decodedTransaction)
  console.log(humanReadableTransaction)
})()
 */
