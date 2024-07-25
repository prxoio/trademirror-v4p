import Web3 from 'web3'
import pkg from 'web3'
const { providers } = pkg

import { updateTradeTpAbi } from '@utils/functionAbis'

const providerUrl = process.env.OPBNB_RPC_URL as string
const web3 = new Web3(new providers.HttpProvider(providerUrl))

const contractAddress = process.env.APOLLOX_CONTRACT_OPBNB as string

const contract = new web3.eth.Contract(updateTradeTpAbi, contractAddress)

interface UpdateTradeTpParams {
  tradeHash: string
  takeProfitPrice: number
}

/**
 * Updates the take profit price of a trade.
 * @param tradeHash - The hash of the trade.
 * @param takeProfitPrice - The new take profit price.
 * @returns A promise that resolves to the transaction receipt.
 */
export async function updateTradeTp({
  tradeHash,
  takeProfitPrice,
}: UpdateTradeTpParams) {
  const txData = contract.methods
    .updateTradeTp(tradeHash, takeProfitPrice)
    .encodeABI()

  const fromAddress = process.env.ACCOUNT_ADDRESS as string
  const privateKey = process.env.PRIVATE_KEY as string
  // Create transaction object
  const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest')
  const gasPrice = await web3.eth.getGasPrice()
  const gasLimit = 2000000 //  web3.eth.estimateGas ??

  const tx = {
    from: fromAddress,
    to: contractAddress,
    gas: gasLimit,
    gasPrice: gasPrice,
    nonce: nonce,
    data: txData,
  }
  // Sign transaction
  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey)
  // Send transaction
  const receipt = await web3.eth.sendSignedTransaction(
    signedTx.rawTransaction as string
  )
  return receipt
}

/*  // Example usage
const tradeHash = '0xe8678ee1ab6f2812520ece4ce3f43499b5ca46cf3694ddb1d2f177d6f961b225'; 
const tp = 65265.9; 
const takeProfitPrice = tp * 1e8; // Convert to uint64

updateTradeTp({ tradeHash, takeProfitPrice })
  .then(receipt => {
    console.log('Transaction successful with hash:', receipt.transactionHash);
  })
  .catch(error => {
    console.error('Error sending transaction:', error);
  }); 
 */