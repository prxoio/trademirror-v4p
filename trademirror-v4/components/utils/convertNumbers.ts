/**
 * Converts numbers and bigints in an object to strings recursively.
 * @param obj - The object to convert.
 * @returns The object with numbers and bigints converted to strings.
 */
export function convertNumbersToStrings(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString()
  } else if (typeof obj === 'number') {
    return obj.toString()
  } else if (Array.isArray(obj)) {
    return obj.map(convertNumbersToStrings)
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj: { [key: string]: any } = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = convertNumbersToStrings(obj[key])
      }
    }
    return newObj
  }
  return obj
}
