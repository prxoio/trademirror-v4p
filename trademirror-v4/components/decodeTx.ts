import Web3 from 'web3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import BN from 'bn.js'

const web3 = new Web3()

// TODO - replace fs with Bun.file()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const methodDirectoryPath = path.resolve(__dirname, './methodDirectory.json')
const abiPath = path.resolve(__dirname, './abi.json')

let methodDirectory: Record<string, string>
let abi: { name: string; inputs: { name: string; type: string }[] }[]

methodDirectory = JSON.parse(fs.readFileSync(methodDirectoryPath, 'utf-8'))
abi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'))

export function parseInputData(inputData: string): {
  methodSignature: string | null
  decodedInput?: Record<string, unknown>
  functionInputs?: { name: string; type: string }[]
} {
  let decodedInput: Record<string, unknown> | null = null
  let formattedOutput: { decodedInput: Record<string, unknown> } | null = null
  let functionInputs: { name: string; type: string }[] = []

  // Extract method id from input
  const methodId = inputData.substring(0, 10)

  const methodSignature = methodDirectory[methodId]
  if (methodSignature) {
    console.log(`Function signature matched: ${methodSignature}`)
    // match function name in methodsig json
    const functionName = methodSignature.split('(')[0]
    const func = abi.find((func) => func.name === functionName)
    if (func) {
      const decodedParams = web3.eth.abi.decodeParameters(
        func.inputs,
        inputData.slice(10)
      )
      // console.log('Decoded Input:', decodedParams.components);
      functionInputs = func.inputs
      decodedInput = func.inputs.reduce((obj, input) => {
        if (input.name) {
          let value = decodedParams[input.name]
          // convert BN to string
          obj[input.name] = value instanceof BN ? value.toString() : value
        }
        return obj
      }, {} as Record<string, unknown>)

      if (decodedInput.data) {
        decodedInput.data = Object.fromEntries(
          Object.entries(decodedInput.data).filter(([key]) => isNaN(Number(key)))
        )
      }

      formattedOutput = {
        decodedInput: decodedInput,
      }

      /* if (formattedOutput?.decodedInput) {
        console.log('Formatted Decoded Input:', formattedOutput.decodedInput);
      } */
    } else {
      console.log('Function found in method directory but not in ABI.')
    }
  } else {
    console.log(
      'No matching function signature found. Check method directory and input data.'
    )
    return {
      methodSignature: null,
    }
  }

  return {
    methodSignature: methodSignature,
    decodedInput: formattedOutput?.decodedInput,
    functionInputs: functionInputs,
  }
}
