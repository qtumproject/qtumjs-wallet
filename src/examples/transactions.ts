import { networks } from "../index"

async function main() {
  const network = networks.testnet

  const privateKey = "cQxduP5sUjM6Mwn6wxXhwta5BnU7QmbNfm83Hcfj3fQeiQKCfjBA"

  const wallet = await network.fromWIF(privateKey)

  console.log("wallet address:", wallet.address)

  const txs = await wallet.getTransactions()

  console.log(txs)
}

main().catch((err) => console.log(err))
