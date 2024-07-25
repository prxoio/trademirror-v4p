import { BigNumber } from 'bignumber.js'

/**
 * Calculates the quantity based on the total value and price.
 * @param totalValue - The total value of the trade.
 * @param price - The price of the trade.
 * @returns The normalized quantity.
 */
export function calculateQuantity(totalValue: string | number, price: string) {
  //console.log('totalValue:', totalValue);
  //console.log('price:', price);
  const qty = Number(totalValue) / Number(price)
  //console.log('qty:', qty);
  const qtyNormalized = new BigNumber(qty * 1e10).toFixed(0)
  //console.log('qtyNormalized:', qtyNormalized);
  return qtyNormalized
}
