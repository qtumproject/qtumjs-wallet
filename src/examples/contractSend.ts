import { networks } from "../index"
import { WalletRPCProvider } from "../WalletRPCProvider"

async function main() {
  const network = networks.testnet

  const privateKey = "cQxduP5sUjM6Mwn6wxXhwta5BnU7QmbNfm83Hcfj3fQeiQKCfjBA"

  const wallet = network.fromWIF(privateKey)

  console.log("wallet address:", wallet.address)

  // burnbabyburn
  // e179b912
  const contractAddress = "b10071ee33512ce8a0c06ecbc14a5f585a27a3e2"
  const encodedData = "e179b912"

  // const rawtx = await wallet.generateContractSendTx(contractAddress, encodedData, {
  //   amount: 0.01 * 1e8,
  // })

  // console.log(rawtx)

  // const tx = await wallet.contractSend(contractAddress, encodedData, {
  //   amount: 0.05 * 1e8,
  // })

  const provider = new WalletRPCProvider(wallet)

  const tx = await provider.rawCall("sendToContract", [contractAddress, encodedData, 0.01 * 1e8])

  console.log(tx)
}

main().catch((err) => console.log(err))

/*
OUTPUT:

wallet address: qbkJZTKQfcout2joWVmnvUrJUDTg93bhdv
{ txid: 'dcdb139869f2cc6f5e0ccd0b7afa4cd3f30c6a63a80c1357d4176c03ec2c9da4' }

*/
