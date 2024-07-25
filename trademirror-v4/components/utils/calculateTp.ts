/**
 * Calculates the take profit price based on the initial margin, leverage, BTC buy price, and take profit percentage.
 * 
 * @param initialMargin - The initial margin for the position in USD.
 * @param leverage - The leverage for the position.
 * @param btcBuyPrice - The buy price of BTC.
 * @param takeProfitPercentage - The desired take profit percentage.
 * @returns The calculated take profit price.
 */
export function calculateTakeProfitPrice(
  initialMargin: number,
  leverage: number,
  btcBuyPrice: number,
  takeProfitPercentage: number,
  long: boolean
): number {
  // Calculate total position size
  const totalPositionSize = initialMargin * leverage;
  // Calculate BTC quantity (total position size)
  const btcQuantity = totalPositionSize / btcBuyPrice;
  // Calculate desired profit in USD
  const desiredProfit = (initialMargin * takeProfitPercentage) / 100;
  
  let takeProfitPrice;

  if (long) {
    // For long trades, take profit price is higher
    const newPositionValue = totalPositionSize + desiredProfit;
    takeProfitPrice = newPositionValue / btcQuantity;
  } else {
    // For short trades, take profit price is lower
    const newPositionValue = totalPositionSize - desiredProfit;
    takeProfitPrice = newPositionValue / btcQuantity;
  }

  console.log('Take Profit Price:', takeProfitPrice);
  return takeProfitPrice;
}

  //calculateTakeProfitPrice(0.41, 1000, 63677.88205939, 100)


  /**
 * Calculates the take profit price and stop loss price based on the initial margin, leverage, BTC buy price, take profit percentage, and stop loss percentage.
 * 
 * @param initialMargin - The initial margin for the position.
 * @param leverage - The leverage for the position.
 * @param btcBuyPrice - The buy price of BTC.
 * @param takeProfitPercentage - The desired take profit percentage.
 * @param stopLossPercentage - The desired stop loss percentage.
 * @returns An object containing the calculated take profit price and stop loss price.
 */
export function calculateTpSl(
  initialMargin: number,
  leverage: number,
  btcBuyPrice: number,
  takeProfitPercentage: number,
  stopLossPercentage: number
): { takeProfitPrice: number, stopLossPrice: number } {
  // Calculate total position size
  const totalPositionSize = initialMargin * leverage;
  // Calculate BTC quantity (total position size)
  const btcQuantity = totalPositionSize / btcBuyPrice;
  // Calculate desired profit in USD
  const desiredProfit = (initialMargin * takeProfitPercentage) / 100;
  // Calculate new position value for desired profit
  const newPositionValue = totalPositionSize + desiredProfit;
  // Calculate the take profit BTC price
  const takeProfitPrice = newPositionValue / btcQuantity;

  // Calculate the stop loss price
  let stopLossPrice = 0;
  if (stopLossPercentage !== 0) {
    const stopLossValue = totalPositionSize - (initialMargin * stopLossPercentage) / 100;
    stopLossPrice = stopLossValue / btcQuantity;
  }

  console.log('Take Profit Price:', takeProfitPrice);
  console.log('Stop Loss Price:', stopLossPrice);
  return { takeProfitPrice, stopLossPrice };
}

//calculateTpSl(0.41, 1000, 63677.88205939, 100, 50)