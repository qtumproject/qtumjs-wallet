import { Insight } from "../Insight"
import { networks } from "../Network"
import { Wallet } from "../Wallet"


async function main() {
  const network = networks.mainnet

  const wallet = network.fromMnemonic("hold struggle ready lonely august napkin enforce retire pipe where avoid drip",)

  console.log(wallet.address)
  console.log(network.base58ToHex(wallet.address))
  console.log(network.hexToBase58(network.base58ToHex(wallet.address)))

}

main().catch((err) => console.log("err", err))
