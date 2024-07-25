import { processTransaction } from './startTransaction'
import { type Trader, type Transaction } from '@utils/interfaces'

const takeProfitPercent = process.env.TAKE_PROFIT_PERCENT as string
const stopLossPercent = process.env.STOP_LOSS_PERCENT as string

const BTC_ADDRESS = '0xBAd4ccc91EF0dfFfbCAb1402C519601fbAf244EF'
const BNB_ADDRESS = '0x4200000000000000000000000000000000000006'
const ETH_ADDRESS = '0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea'


function handleMatch(trader: Trader, tx: Transaction) {
  console.error('Match found for:', trader)

  // only copy BTC trades
  if (tx.decodedReadable?.baseSymbol.includes('BTC')) {
    console.error('500BTC trade')
    console.error('Match Found: Initiating 500BTC/USDT trade')
    // initiate a trade on opBNB chain
    processTransaction(
      tx,
      845,
      'USDT',
      BTC_ADDRESS,
      Number(takeProfitPercent),
      Number(stopLossPercent)
    ) // tx object, leverage, inToken, take profit %, stop loss %
  } else if (tx.decodedReadable?.baseSymbol.includes('BNB')) {
    console.error('BNB trade')
    console.error('Match Found: Initiating BNB/USDT trade')
    // initiate a trade on opBNB chain
    processTransaction(
      tx,
      225,
      'USDT',
      BNB_ADDRESS,
      Number(takeProfitPercent),
      (Number(stopLossPercent)/1.3)
    ) // tx object, leverage, inToken, take profit %, stop loss %
  } else if (tx.decodedReadable?.baseSymbol.includes('ETH')) {
    console.error('BNB trade')
    console.error('Match Found: Initiating ETH/USDT trade')
    // initiate a trade on opBNB chain
    processTransaction(
      tx,
      225,
      'USDT',
      ETH_ADDRESS,
      Number(takeProfitPercent),
      (Number(stopLossPercent)/1.3)
    ) // tx object, leverage, inToken, take profit %, stop loss %
  } else 
  {
    console.error('NO TRADE - Match Found, but is not an BTC/ETH/BNB Trade')
  }






}

// check for matching address
function checkForAddressMatch(tx: Transaction, data: Trader[]) {
  const match = data.find(
    (trader) => trader.address.toLowerCase() === tx.from.toLowerCase()
  )
  if (match) {
    handleMatch(match, tx)
  } else {
    console.log('No match found for address:', tx.from)
  }
}

// read JSON trader list and check for matches
export async function startTrade(tx: Transaction) {
  try {
    const traderstats = Bun.file('components/trade/trader-stats.json')
    const data: Trader[] = await traderstats.json()
    // check for address match
    checkForAddressMatch(tx, data)
  } catch (error) {
    console.error('Error reading or parsing data:', error)
  }
}

/* //testing
const tx: Transaction = {
  from: '0xc1b42549b870a8822d8f053300f981692cc63e85',
  // other transaction fields if necessary
} */
