import { networks } from "../index"
import { IUTXO } from "../tx"
import { WalletRPCProvider } from "../WalletRPCProvider"

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

  const provider = new WalletRPCProvider(wallet)

  const result = await provider.rawCall("callContract", [contractAddress, encodedData])

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => console.log(err))

/*
OUTPUT:

{
  "address": "b10071ee33512ce8a0c06ecbc14a5f585a27a3e2",
  "executionResult": {
    "gasUsed": 13877,
    "excepted": "None",
    "newAddress": "b10071ee33512ce8a0c06ecbc14a5f585a27a3e2",
    "output": "",
    "codeDeposit": 0,
    "gasRefunded": 15000,
    "depositSize": 0,
    "gasForDeposit": 0
  },
  "transactionReceipt": {
    "stateRoot": "a5b0abb6a587d90cbf3fe7b7cdc39eab28a057cb72a8d958bc877562d2f104c6",
    "gasUsed": 13877,
    "bloom": "00000000000000000000200040000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "log": [
      {
        "address": "b10071ee33512ce8a0c06ecbc14a5f585a27a3e2",
        "topics": [
          "9c31339612219a954bda4c790e4b182b6499bdf1464c392cb50e61d8afa1f9f2"
        ],
        "data": "000000000000000000000000ffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000"
      }
    ]
  }
}
*/
