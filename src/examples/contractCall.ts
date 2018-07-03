import { networks } from "../index"
import { IUTXO } from "../tx"

async function main() {
  const network = networks.testnet

  const privateKey = "cQxduP5sUjM6Mwn6wxXhwta5BnU7QmbNfm83Hcfj3fQeiQKCfjBA"

  const wallet = network.fromWIF(privateKey)

  // burnbabyburn
  // e179b912
  const contractAddress = "b10071ee33512ce8a0c06ecbc14a5f585a27a3e2"
  const encodedData = "e179b912"

  // const result = await wallet.contractCall(contractAddress, encodedData, {
  //   amount: 0.01 * 1e8,
  // })

  const result = await wallet.rawCall("callContract", [contractAddress, encodedData])

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => console.log(err))

/*
OUTPUT:

public address: qWAnfBnRNhZBqtgSdgHjSfS2D5Jawmafra
*/
