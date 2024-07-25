import { Web3, type ContractAbi, type AbiFragment, type AbiInput } from 'web3'
import fs from 'fs'
import BN from 'bn.js'

const web3 = new Web3()

async function handleTx(tx: string) {
  const methodFile = Bun.file('components/methodDirectory.json')
  //let methodDirectory: Record<string, string>;
  // Add index signature to methodDirectory
  interface MethodDirectory extends Record<string, string> {
    [key: string]: string
  }

  const methodDirectory: MethodDirectory =
    (await methodFile.json()) as MethodDirectory

  const abifile = Bun.file('components/abi.json')
  //let abi: { name: string; inputs: { name: string; type: string }[] }[];
  const abi = await abifile.json()
  // Example inputData 
  const inputData =
    '0xb7aeae66000000000000000000000000bad4ccc91ef0dfffbcab1402c519601fbaf244ef0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005af3107a4000000000000000000000000000000000000000000000000000000000000073a79400000000000000000000000000000000000000000000000000000639683a7ebe00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000062d9306ee800000000000000000000000000000000000000000000000000000000000000001'

  // Extract method identifier (first 10 characters)
  const methodId = inputData.substring(0, 10)

  const methodSignature = methodDirectory[methodId]
  if (methodSignature) {
    console.log(`Function signature matched: ${methodSignature}`)
    // Extract the function name from signature
    const functionName = methodSignature.split('(')[0]
    const func = abi.find((func: { name: string }) => func.name === functionName)
    // ...
    if (func) {
      let decodedInput = web3.eth.abi.decodeParameters(
        func.inputs,
        inputData.slice(10)
      )

      //console.log('Decoded Input:', decodedInput)
      return decodedInput
    } else {
      console.log('Function found in method directory but not in ABI.')
    }
    // ...
  } else {
    console.log(
      'No matching function signature found. Check method directory and input data.'
    )
  }
}

console.log(convertNumbersToStrings(await handleTx('')))

function convertNumbersToStrings(obj: any): any {
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
