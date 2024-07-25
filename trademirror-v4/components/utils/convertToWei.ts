import { BigNumber } from 'bignumber.js'

/**
 * Converts a value to its equivalent in wei.
 * @param value - The value to convert.
 * @param decimals - The number of decimal places to shift the value by.
 * @returns The converted value in wei.
 */
export function convertToWei(value: BigNumber.Value, decimals: number) {
    return new BigNumber(value).shiftedBy(decimals).toFixed(0)
  }
  