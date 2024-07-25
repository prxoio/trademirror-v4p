import Web3 from 'web3'
import pkg from 'web3'
const { providers } = pkg

import { updateTradeTpAndSlAbi } from '@utils/functionAbis'

const providerUrl = process.env.OPBNB_RPC_URL as string
const web3 = new Web3(new providers.HttpProvider(providerUrl))

const contractAddress = process.env.APOLLOX_CONTRACT_OPBNB as string

const contract = new web3.eth.Contract(updateTradeTpAndSlAbi, contractAddress)

interface UpdateTradeTpParams {
  tradeHash: string
  takeProfitPrice: number
  stopLossPrice: number
}

export async function updateTradeTpAndSl({
  tradeHash,
  takeProfitPrice,
  stopLossPrice,
}: UpdateTradeTpParams) {
  try {
    const txData = contract.methods
      .updateTradeTpAndSl(tradeHash, takeProfitPrice, stopLossPrice)
      .encodeABI()

    const fromAddress = process.env.ACCOUNT_ADDRESS as string
    const privateKey = process.env.PRIVATE_KEY as string

    // Create transaction object
    const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest')
    const gasPrice = await web3.eth.getGasPrice()
    const gasLimit = 2000000 // Adjust gas limit as needed

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
    if (!signedTx.rawTransaction) {
      throw new Error('Failed to sign the transaction')
    }

    // Send transaction
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    )
    return receipt
  } catch (error) {
    console.error('Error in updateTradeTpAndSl function:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Stack trace:', error.stack)
    }
    throw error // Re-throw the error to be caught by the caller
  }
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
