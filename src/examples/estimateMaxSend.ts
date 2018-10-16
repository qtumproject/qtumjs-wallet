import { networks } from "../Network"

const wallet = networks.testnet.fromMnemonic(
  "hold struggle ready lonely august napkin enforce retire pipe where avoid drip",
)

const utxos = require("../../utxos.json")

async function main() {
  const maxSend = await wallet.sendEstimateMaxValue(wallet.address)

  console.log("max send", maxSend / 1e8)
}

main().catch((err) => console.log("err", err))
