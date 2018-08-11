import { networks } from "../index"

async function main() {
  const network = networks.testnet

  const privateKey = "cQxduP5sUjM6Mwn6wxXhwta5BnU7QmbNfm83Hcfj3fQeiQKCfjBA"

  const wallet = network.fromWIF(privateKey)

  console.log("wallet address:", wallet.address)

  // qZhHHuaL6e5urPyQrzHpjsZCwAgtL8TTpt
  const contractAddress = "b10071ee33512ce8a0c06ecbc14a5f585a27a3e2"

  // burnbabyburn == e179b912
  const encodedData = "e179b912"

  // const rawtx = await wallet.generateContractSendTx(contractAddress, encodedData, {
  //   amount: 0.01 * 1e8,
  // })

  // console.log(rawtx)

  const tx = await wallet.contractSend(contractAddress, encodedData, {
    amount: 0.05 * 1e8,
  })

  console.log(tx)
}

main().catch((err) => console.log(err))

